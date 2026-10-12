// Source excerpts from legend-apps-main-integration, inspected September 6, 2026.
// These are presentation strings, not alternate implementations or runnable samples.
export const snippets = {
  sidebar: `<SidebarSplitView\n  appearance="system"\n  contentMinWidth={420}\n  sidebarMinWidth={220}\n  sidebarWidth={260}\n>\n  <ChatSidebar ... />\n  <TranscriptPane ... />\n</SidebarSplitView>`,
  native: `export interface ChatDocument\n  extends HybridObject<{ ios: "c++" }> {\n  readonly documentId: string;\n  readonly rowCount: number;\n  getRowMetadata(index: number): ChatRowMetadata;\n  // Other members omitted\n}`,
  cpp: `ChatRowMetadata HybridChatDocument::getRowMetadata(double index) {\n  const size_t displayIndex = checkedIndex(index);\n  const ChatDisplayRow& displayRow = displayRows_[displayIndex];\n  const ChatRow& row = rows_[displayRow.firstRow];\n  // Metadata construction follows\n}`,
  glass: `if #available(macOS 26.0, *) {\n    let glassView = NSGlassEffectView(frame: bounds)\n    glassView.autoresizingMask = [.width, .height]\n    glassView.contentView = contentContainer\n    // Remaining setup omitted\n}`,
  glassReact: `<GlassEffectView glassStyle="regular">\n  <Text>Actually the platform material</Text>\n</GlassEffectView>`,
  accessibility: `<Pressable\n  accessibilityLabel={entry.summary.title}\n  accessibilityRole="button"\n  accessibilityState={{ selected }}\n  onPress={handlePress}\n  // Styling omitted\n>`,
  agent: `agent-device open "Legend Chat History" \\\n  --platform macos --surface app --session talk\n\nagent-device snapshot -i --session talk\n\nagent-device screenshot ./chat-history.png --session talk`,
  deck: `<Scene title="1,024 fragments become visible rows" ...>\n  <TypeGPUShader\n    code={gpuConstellation}\n    particles particleCount={gpuConstellationCount}\n    width={1680}\n    height={580}\n  />\n</Scene>`,
} as const;
