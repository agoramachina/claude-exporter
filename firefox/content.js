// Prevent double-injection of content script
if (window.claudeExporterContentScriptLoaded) {
  console.log('Claude Exporter content script already loaded, skipping re-injection');
} else {
  window.claudeExporterContentScriptLoaded = true;

// Capture unhandled errors for diagnostics (sanitized, stored in chrome.storage.local)
if (typeof initErrorCapture === 'function') initErrorCapture('content');

// Note: Organization ID is now stored in extension settings
// Users need to configure it in the extension options page

// Record export timestamp for a conversation
function recordExportTimestamp(conversationId) {
  chrome.storage.local.get(['exportTimestamps'], (result) => {
    const timestamps = result.exportTimestamps || {};
    timestamps[conversationId] = new Date().toISOString();
    chrome.storage.local.set({ exportTimestamps: timestamps });
  });
}

// Record export timestamps for multiple conversations
function recordExportTimestamps(conversationIds) {
  chrome.storage.local.get(['exportTimestamps'], (result) => {
    const timestamps = result.exportTimestamps || {};
    const now = new Date().toISOString();
    for (const id of conversationIds) {
      timestamps[id] = now;
    }
    chrome.storage.local.set({ exportTimestamps: timestamps });
  });
}

// Snapshot each conversation's current model so it survives a model bounce
// (e.g. when a model retires and Claude silently moves old chats onto a new
// one). Only the raw API model is recorded — never an inferred guess.
function recordModelSnapshots(conversations) {
  if (!Array.isArray(conversations)) return;
  chrome.storage.local.get(['modelSnapshots'], (result) => {
    const snapshots = result.modelSnapshots || {};
    const now = new Date().toISOString();
    let changed = false;
    for (const conv of conversations) {
      const model = conv && conv.model;
      const id = conv && conv.uuid;
      if (!model || !id) continue; // skip null-model chats — don't snapshot a guess
      const existing = snapshots[id];
      if (!existing) {
        snapshots[id] = {
          firstSeen: model,
          firstSeenAt: now,
          current: model,
          currentAt: now,
          history: [{ model, at: now }]
        };
        changed = true;
      } else if (existing.current !== model) {
        existing.current = model;
        existing.currentAt = now;
        existing.history = existing.history || [];
        existing.history.push({ model, at: now });
        changed = true;
      }
    }
    if (changed) {
      chrome.storage.local.set({ modelSnapshots: snapshots });
    }
  });
}

// Helper function to format datetime in local time for filenames
function getLocalDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

  // Fetch conversation data
  async function fetchConversation(orgId, conversationId) {
    const url = `https://claude.ai/api/organizations/${orgId}/chat_conversations/${conversationId}?tree=True&rendering_mode=messages&render_all_tools=true`;

    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status}`);
    }

    return await response.json();
  }
  
  // Fetch all conversations
  async function fetchAllConversations(orgId) {
    const url = `https://claude.ai/api/organizations/${orgId}/chat_conversations`;
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.status}`);
    }

    const conversations = await response.json();
    recordModelSnapshots(conversations); // capture current models before any bounce
    return conversations;
  }

  // Handle messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Auto-detect organization ID from Claude.ai API
  if (request.action === 'detectOrgId') {
    console.log('Auto-detecting organization ID...');

    fetch('https://claude.ai/api/organizations', {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch organizations: ${response.status}`);
        }
        return response.json();
      })
      .then(orgs => {
        if (Array.isArray(orgs) && orgs.length > 0) {
          // Find the org with "chat" capability (the Claude.ai org, not the API org)
          const chatOrg = orgs.find(org =>
            org.capabilities && org.capabilities.includes('chat')
          );
          const orgId = chatOrg ? chatOrg.uuid : orgs[0].uuid;
          console.log('Auto-detected organization ID:', orgId, chatOrg ? '(chat org)' : '(fallback to first)');
          sendResponse({ success: true, orgId });
        } else {
          throw new Error('No organizations found');
        }
      })
      .catch(error => {
        console.error('Auto-detect org ID failed:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  if (request.action === 'exportConversation') {
    console.log('Export conversation request received:', request);

    fetchConversation(request.orgId, request.conversationId)
      .then(data => {
        console.log('Conversation data fetched successfully:', data);

        // Validate conversation data structure
        if (!data || !data.chat_messages || !Array.isArray(data.chat_messages)) {
          throw new Error('Invalid conversation data structure. Please refresh the page and try again.');
        }

        // Infer model if null
        data.model = inferModel(data);
        const safeName = sanitizeFilename(data.name || request.conversationId);
        
        // Check if we need to extract artifacts to separate files
        if (request.extractArtifacts || request.flattenArtifacts) {
          // Extract artifacts
          const artifactFiles = extractArtifactFiles(data, request.artifactFormat || 'original');

          if (artifactFiles.length > 0) {
            // Create a ZIP with artifacts (and optionally conversation)
            const zip = new JSZip();

            // Add conversation file only if includeChats is true
            if (request.includeChats !== false) {
              let conversationContent, conversationFilename;
              switch (request.format) {
                case 'markdown':
                  conversationContent = convertToMarkdown(data, request.includeMetadata, request.conversationId, request.includeArtifacts, request.includeThinking);
                  conversationFilename = `${safeName}.md`;
                  break;
                case 'text':
                  conversationContent = convertToText(data, request.includeMetadata, request.includeArtifacts, request.includeThinking);
                  conversationFilename = `${safeName}.txt`;
                  break;
                default:
                  conversationContent = JSON.stringify(data, null, 2);
                  conversationFilename = `${safeName}.json`;
              }

              // Flat export: add to Chats folder
              if (request.flattenArtifacts && !request.extractArtifacts) {
                const chatsFolder = zip.folder('Chats');
                chatsFolder.file(conversationFilename, conversationContent);
              } else {
                // Nested or no artifact extraction: add to root
                zip.file(conversationFilename, conversationContent);
              }
            }

            // Add artifact files
            // Nested: create artifacts subfolder
            if (request.extractArtifacts) {
              const artifactsFolder = request.includeChats !== false ? zip.folder('artifacts') : zip;
              for (const artifact of artifactFiles) {
                artifactsFolder.file(artifact.filename, artifact.content);
              }
            }

            // Flat: add artifacts with conversation name prefix to Artifacts folder
            if (request.flattenArtifacts && !request.extractArtifacts) {
              const artifactsFolder = zip.folder('Artifacts');
              for (const artifact of artifactFiles) {
                const filename = `${safeName}_${artifact.filename}`;
                artifactsFolder.file(filename, artifact.content);
              }
            }

            // Generate and download ZIP
            zip.generateAsync({ type: 'blob' }).then(blob => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${safeName}.zip`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(url), 10000);
            });

            console.log(`Downloading ZIP with conversation and ${artifactFiles.length} artifact(s)`);
            recordExportTimestamp(request.conversationId);
            sendResponse({ success: true });
          } else {
            // No artifacts found, just export conversation normally
            let content, filename, type;
            switch (request.format) {
              case 'markdown':
                content = convertToMarkdown(data, request.includeMetadata, request.conversationId, request.includeArtifacts, request.includeThinking);
                filename = `${safeName}.md`;
                type = 'text/markdown';
                break;
              case 'text':
                content = convertToText(data, request.includeMetadata, request.includeArtifacts, request.includeThinking);
                filename = `${safeName}.txt`;
                type = 'text/plain';
                break;
              default:
                content = JSON.stringify(data, null, 2);
                filename = `${safeName}.json`;
                type = 'application/json';
            }
            console.log('No artifacts found. Downloading file:', filename);
            downloadFile(content, filename, type);
            recordExportTimestamp(request.conversationId);
            sendResponse({ success: true });
          }
        } else {
          // Normal export without artifact extraction
          if (request.includeChats === false) {
            // If chats are disabled and we're not extracting artifacts, there's nothing to export
            console.log('No content to export (chats disabled, artifacts not extracted)');
            sendResponse({
              success: false,
              error: 'Nothing to export. Enable "Include conversation text" or "Artifacts nested".'
            });
          } else {
            let content, filename, type;
            switch (request.format) {
              case 'markdown':
                content = convertToMarkdown(data, request.includeMetadata, request.conversationId, request.includeArtifacts, request.includeThinking);
                filename = `${safeName}.md`;
                type = 'text/markdown';
                break;
              case 'text':
                content = convertToText(data, request.includeMetadata, request.includeArtifacts, request.includeThinking);
                filename = `${safeName}.txt`;
                type = 'text/plain';
                break;
              default:
                content = JSON.stringify(data, null, 2);
                filename = `${safeName}.json`;
                type = 'application/json';
            }

            console.log('Downloading file:', filename);
            downloadFile(content, filename, type);
            recordExportTimestamp(request.conversationId);
            sendResponse({ success: true });
          }
        }
      })
      .catch(error => {
        console.error('Export conversation error:', error);
        sendResponse({ 
          success: false, 
          error: error.message,
          details: error.stack 
        });
      });
    
    return true;
  }
    
      if (request.action === 'exportAllConversations') {
    console.log('Export all conversations request received:', request);
    
    fetchAllConversations(request.orgId)
      .then(async conversations => {
        console.log(`Fetched ${conversations.length} conversations`);
        
        if (request.extractArtifacts || request.flattenArtifacts) {
          // When extracting artifacts (nested or flat), always create a ZIP
          const zip = new JSZip();
          const usedNames = new Set();
          let processed = 0;
          let included = 0;
          let errors = [];

          for (const conv of conversations) {
            try {
              processed++;
              console.log(`Scanning conversation ${processed}/${conversations.length}: ${conv.name || conv.uuid}`);
              const fullConv = await fetchConversation(request.orgId, conv.uuid);

              // Infer model if null
              fullConv.model = inferModel(fullConv);

              // Extract artifacts first to check if this conversation should be included
              const artifactFiles = extractArtifactFiles(fullConv, request.artifactFormat || 'original');

              // If chats are disabled and no artifacts, skip this conversation
              if (request.includeChats === false && artifactFiles.length === 0) {
                console.log(`  Skipping - no artifacts found (${processed}/${conversations.length} scanned, ${included} included)`);
                // Add a small delay to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
              }

              // Sanitize folder name
              const folderName = uniqueFilename(sanitizeFilename(conv.name || conv.uuid), '', usedNames);

              // Generate conversation content
              let conversationContent, conversationFilename;
              if (request.format === 'markdown') {
                conversationContent = convertToMarkdown(fullConv, request.includeMetadata, conv.uuid, request.includeArtifacts, request.includeThinking);
                conversationFilename = `${folderName}.md`;
              } else if (request.format === 'text') {
                conversationContent = convertToText(fullConv, request.includeMetadata, request.includeArtifacts, request.includeThinking);
                conversationFilename = `${folderName}.txt`;
              } else {
                conversationContent = JSON.stringify(fullConv, null, 2);
                conversationFilename = `${folderName}.json`;
              }

              // Flat export: use Chats and Artifacts top-level folders
              if (request.flattenArtifacts && !request.extractArtifacts) {
                // Add chat file to Chats folder if chats are enabled
                if (request.includeChats !== false) {
                  const chatsFolder = zip.folder('Chats');
                  chatsFolder.file(conversationFilename, conversationContent);
                }

                // Add artifacts to Artifacts folder with conversation name prefix
                if (artifactFiles.length > 0) {
                  const artifactsFolder = zip.folder('Artifacts');
                  for (const artifact of artifactFiles) {
                    const artifactFilename = `${folderName}_${artifact.filename}`;
                    artifactsFolder.file(artifactFilename, artifact.content);
                  }
                }
              }
              // Nested export: create per-conversation folders with artifacts subfolder
              else if (request.extractArtifacts) {
                const convFolder = zip.folder(folderName);

                // Add conversation file only if includeChats is true
                if (request.includeChats !== false) {
                  convFolder.file(conversationFilename, conversationContent);
                }

                // Add artifact files in nested artifacts subfolder
                if (artifactFiles.length > 0) {
                  const artifactsFolder = request.includeChats !== false ? convFolder.folder('artifacts') : convFolder;
                  for (const artifact of artifactFiles) {
                    artifactsFolder.file(artifact.filename, artifact.content);
                  }
                }
              }

              included++;
              console.log(`  Added to export (${processed}/${conversations.length} scanned, ${included} included)`);

              // Add a small delay to avoid overwhelming the API
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error(`Failed to export conversation ${conv.uuid}:`, error);
              errors.push(`${conv.name || conv.uuid}: ${error.message}`);
            }
          }

          // Generate and download ZIP
          zip.generateAsync({ type: 'blob' }).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Format: claude-artifacts-20251031-143045.zip or claude-exports-20251031-143045.zip
            const datetime = getLocalDateTimeString();
            // Use 'claude-artifacts' when ONLY flat artifacts are exported
            const prefix = (request.flattenArtifacts && !request.extractArtifacts && request.includeChats === false) ? 'claude-artifacts' : 'claude-exports';
            a.download = `${prefix}-${datetime}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 10000);
          });

          // Record export timestamps for all successfully exported conversations
          const exportedIds = conversations.map(c => c.uuid).filter(id => !errors.some(e => e.includes(id)));
          recordExportTimestamps(exportedIds);

          if (errors.length > 0) {
            console.warn('Some conversations failed to export:', errors);
            sendResponse({
              success: true,
              count: included,
              warnings: `Exported ${included}/${conversations.length} conversations. Some failed: ${errors.join('; ')}`
            });
          } else {
            sendResponse({ success: true, count: included });
          }
        } else {
          // For other formats without artifact extraction, create a ZIP
          const zip = new JSZip();
          const usedNames = new Set();
          let count = 0;
          let errors = [];

          for (const conv of conversations) {
            try {
              console.log(`Fetching full conversation ${count + 1}/${conversations.length}: ${conv.uuid}`);
              const fullConv = await fetchConversation(request.orgId, conv.uuid);

              // Infer model if null
              fullConv.model = inferModel(fullConv);

              let content, filename;
              const safeName = uniqueFilename(sanitizeFilename(conv.name || conv.uuid), '', usedNames);

              if (request.format === 'markdown') {
                content = convertToMarkdown(fullConv, request.includeMetadata, conv.uuid, request.includeArtifacts, request.includeThinking);
                filename = `${safeName}.md`;
              } else if (request.format === 'text') {
                content = convertToText(fullConv, request.includeMetadata, request.includeArtifacts, request.includeThinking);
                filename = `${safeName}.txt`;
              } else {
                content = JSON.stringify(fullConv, null, 2);
                filename = `${safeName}.json`;
              }

              zip.file(filename, content);
              count++;

              // Add a small delay to avoid overwhelming the API
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error(`Failed to export conversation ${conv.uuid}:`, error);
              errors.push(`${conv.name || conv.uuid}: ${error.message}`);
            }
          }

          // Generate and download ZIP
          zip.generateAsync({ type: 'blob' }).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const datetime = getLocalDateTimeString();
            a.download = `claude-exports-${datetime}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 10000);
          });

          // Record export timestamps for successfully exported conversations
          const exportedIds = conversations.map(c => c.uuid).filter(id => !errors.some(e => e.includes(id)));
          recordExportTimestamps(exportedIds);

          if (errors.length > 0) {
            console.warn('Some conversations failed to export:', errors);
            sendResponse({
              success: true,
              count,
              warnings: `Exported ${count}/${conversations.length} conversations. Some failed: ${errors.join('; ')}`
            });
          } else {
            sendResponse({ success: true, count });
          }
        }
      })
      .catch(error => {
        console.error('Export all conversations error:', error);
        sendResponse({
          success: false,
          error: error.message,
          details: error.stack
        });
      });

    return true;
  }

  // Handle loadConversations request from browse page
  if (request.action === 'loadConversations') {
    console.log('Load conversations request received from browse page');

    fetchAllConversations(request.orgId)
      .then(conversations => {
        sendResponse({ success: true, conversations: conversations });
      })
      .catch(error => {
        console.error('Load conversations error:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });

    return true;
  }

  // Handle loadProjects request from browse page
  if (request.action === 'loadProjects') {
    console.log('Load projects request received from browse page');

    fetch(`https://claude.ai/api/organizations/${request.orgId}/projects`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(projects => {
        sendResponse({ success: true, projects: projects });
      })
      .catch(error => {
        console.error('Load projects error:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });

    return true;
  }
  });

} // End of double-injection guard