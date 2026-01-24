import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Editor, JSONContent } from '@tiptap/core';
import { getTranslations, type Language } from '../../lib/i18n';
import { computeButtonState, getButtonText } from '../../lib/buttonState';
import { updateStoredData } from '../../lib/dataStore';
import { type IntroCheckboxState } from '../../lib/types/editorTypes';
import { 
  RecipientsBlock, 
  ConditionsBlock, 
  DateTimeInline, 
  QuorumInline, 
  DynamicDataExtension,
  hasNodeTypeInJSON 
} from '../../lib/tiptap/extensions';
import { createTiptapEditor } from '../../lib/tiptap/createEditor';
import { hasJsonContent } from '../../lib/tiptap/utils';
import { generateExampleInEditor } from '../../lib/tiptap/editorHelpers';
import {
  createCheckboxSyncState,
  syncCheckboxWithNode,
  computeInitialCheckboxState,
  type CheckboxSyncState,
} from '../../lib/checkboxSync';
import { getInitialSidePanelState, saveSidePanelState } from '../../lib/sidePanelState';
import type { Recipient } from '../../lib/types/recipient';
import { EditorLayout } from '../ui/EditorLayout';
import { CheckboxItem } from '../ui/CheckboxItem';
import { ActionButtons } from '../ui/ActionButtons';
import { EssentialSection } from '../ui/EssentialSection';
import { RichTextToolbar } from '../ui/RichTextToolbar';
import '../../styles/tiptap-editor.css';
import './IntroMessageEditor.css';

interface IntroMessageEditorProps {
  lang: Language;
  initialValue?: JSONContent | null;
  initialCheckboxState?: IntroCheckboxState;
  threshold: number;
  conditions?: JSONContent | null;
  recipients?: Recipient[];
  onContinue: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
  onBack: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
}

export function IntroMessageEditor({ 
  lang, 
  initialValue, 
  initialCheckboxState, 
  threshold, 
  conditions, 
  recipients, 
  onContinue, 
  onBack 
}: IntroMessageEditorProps) {
  const t = useMemo(() => getTranslations(lang), [lang]);

  // Get initial content - empty by default
  const initialContent = initialValue ?? null;

  // Initialize checkbox states based on content detection or saved state
  const getInitialCheckboxStates = useCallback((content: JSONContent | null, saved?: IntroCheckboxState) => {
    return {
      authorIdentity: saved?.authorIdentity ?? false,
      secretHolders: computeInitialCheckboxState(hasNodeTypeInJSON(content, 'recipientsBlock'), saved?.secretHolders),
      openingConditions: computeInitialCheckboxState(hasNodeTypeInJSON(content, 'conditionsBlock'), saved?.openingConditions),
      dated: computeInitialCheckboxState(hasNodeTypeInJSON(content, 'dateTimeInline'), saved?.dated),
      quorum: computeInitialCheckboxState(hasNodeTypeInJSON(content, 'quorumInline'), saved?.quorum),
      directives: saved?.directives ?? false,
    };
  }, []);

  const [sidePanelOpen, setSidePanelOpen] = useState(() => getInitialSidePanelState('intro', true));
  const [messageJson, setMessageJson] = useState<JSONContent | null>(initialContent);
  const [editorVersion, setEditorVersion] = useState(0);

  // Checkbox states
  const initCheckboxes = useMemo(() => getInitialCheckboxStates(initialContent, initialCheckboxState), []);
  const [checkAuthorIdentity, setCheckAuthorIdentity] = useState(initCheckboxes.authorIdentity);
  const [checkSecretHolders, setCheckSecretHolders] = useState(initCheckboxes.secretHolders);
  const [checkOpeningConditions, setCheckOpeningConditions] = useState(initCheckboxes.openingConditions);
  const [checkDated, setCheckDated] = useState(initCheckboxes.dated);
  const [checkQuorum, setCheckQuorum] = useState(initCheckboxes.quorum);
  const [checkDirectives, setCheckDirectives] = useState(initCheckboxes.directives);

  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);

  // Sync states for checkboxes (refs to persist across renders)
  const recipientsSyncStateRef = useRef<CheckboxSyncState>(
    createCheckboxSyncState(hasNodeTypeInJSON(initialContent, 'recipientsBlock'))
  );
  const conditionsSyncStateRef = useRef<CheckboxSyncState>(
    createCheckboxSyncState(hasNodeTypeInJSON(initialContent, 'conditionsBlock'))
  );
  const dateTimeSyncStateRef = useRef<CheckboxSyncState>(
    createCheckboxSyncState(hasNodeTypeInJSON(initialContent, 'dateTimeInline'))
  );
  const quorumSyncStateRef = useRef<CheckboxSyncState>(
    createCheckboxSyncState(hasNodeTypeInJSON(initialContent, 'quorumInline'))
  );

  // Auto-detect presence of components
  const hasRecipientsBlock = useMemo(() => hasNodeTypeInJSON(messageJson, 'recipientsBlock'), [messageJson]);
  const hasConditionsBlock = useMemo(() => hasNodeTypeInJSON(messageJson, 'conditionsBlock'), [messageJson]);
  const hasDateTimeInline = useMemo(() => hasNodeTypeInJSON(messageJson, 'dateTimeInline'), [messageJson]);
  const hasQuorumInline = useMemo(() => hasNodeTypeInJSON(messageJson, 'quorumInline'), [messageJson]);

  // Sync checkboxes when components are added/removed
  useEffect(() => {
    syncCheckboxWithNode(hasRecipientsBlock, recipientsSyncStateRef.current, setCheckSecretHolders);
  }, [hasRecipientsBlock]);

  useEffect(() => {
    syncCheckboxWithNode(hasConditionsBlock, conditionsSyncStateRef.current, setCheckOpeningConditions);
  }, [hasConditionsBlock]);

  useEffect(() => {
    syncCheckboxWithNode(hasDateTimeInline, dateTimeSyncStateRef.current, setCheckDated);
  }, [hasDateTimeInline]);

  useEffect(() => {
    syncCheckboxWithNode(hasQuorumInline, quorumSyncStateRef.current, setCheckQuorum);
  }, [hasQuorumInline]);

  const hasContent = useMemo(() => hasJsonContent(messageJson), [messageJson]);
  const allEssentialsChecked = useMemo(() => 
    checkAuthorIdentity && checkSecretHolders && checkOpeningConditions && checkDated && checkQuorum,
    [checkAuthorIdentity, checkSecretHolders, checkOpeningConditions, checkDated, checkQuorum]
  );
  const anyChecked = useMemo(() => 
    checkAuthorIdentity || checkSecretHolders || checkOpeningConditions || checkDated || checkQuorum || checkDirectives,
    [checkAuthorIdentity, checkSecretHolders, checkOpeningConditions, checkDated, checkQuorum, checkDirectives]
  );

  const buttonState = useMemo(() => computeButtonState(hasContent, anyChecked, allEssentialsChecked), [hasContent, anyChecked, allEssentialsChecked]);
  const buttonText = useMemo(() => getButtonText(buttonState, t.introEditor.buttons), [buttonState, t]);

  const getCurrentCheckboxState = useCallback((): IntroCheckboxState => ({
    authorIdentity: checkAuthorIdentity,
    secretHolders: checkSecretHolders,
    openingConditions: checkOpeningConditions,
    dated: checkDated,
    quorum: checkQuorum,
    directives: checkDirectives,
  }), [checkAuthorIdentity, checkSecretHolders, checkOpeningConditions, checkDated, checkQuorum, checkDirectives]);

  const handleContinue = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (hasContent && editor) {
      onContinue(editor.getJSON(), getCurrentCheckboxState());
    }
  }, [hasContent, getCurrentCheckboxState, onContinue]);

  const handleBack = useCallback(() => {
    const editor = editorInstanceRef.current;
    onBack(editor?.getJSON() ?? null, getCurrentCheckboxState());
  }, [getCurrentCheckboxState, onBack]);

  const generateExample = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return;
    const exampleContent = t.introEditor.sidePanel.exampleContentJson;

    generateExampleInEditor(editor, exampleContent, hasContent);
    
    setMessageJson(editor.getJSON());
    setEditorVersion(v => v + 1);
  }, [t, hasContent]);

  /**
   * Update dynamic data via TipTap command (triggers NodeView updates)
   */
  const updateDynamicData = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return;
    editor.commands.setDynamicData({
      recipients: recipients ?? [],
      conditions: conditions ?? null,
      threshold,
      lang,
      contactTypeLabels: t.whoEditor.contactTypes,
    });
  }, [recipients, conditions, threshold, lang, t]);

  // Initialize TipTap editor
  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      const newEditor = createTiptapEditor({
        element: editorRef.current,
        content: initialContent,
        placeholder: t.introEditor.placeholder,
        contentClass: 'tiptap-content',
        enableHeadings: true,
        extensions: [
          DynamicDataExtension,
          RecipientsBlock, 
          ConditionsBlock, 
          DateTimeInline, 
          QuorumInline
        ],
        onUpdate: (json) => {
          setMessageJson(json);
          setEditorVersion(v => v + 1);
        },
      });
      
      editorInstanceRef.current = newEditor;
      setEditorVersion(v => v + 1);
      
      // Set initial dynamic data after editor is ready
      setTimeout(() => updateDynamicData(), 0);
    }

    return () => {
      editorInstanceRef.current?.destroy();
      editorInstanceRef.current = null;
    };
  }, [t.introEditor.placeholder]);

  // Update dynamic content when props change
  useEffect(() => {
    updateDynamicData();
  }, [updateDynamicData]);

  // Auto-save
  useEffect(() => {
    updateStoredData((currentData) => ({
      ...currentData,
      intro: { message: messageJson, checkboxState: getCurrentCheckboxState() }
    }));
  }, [messageJson, getCurrentCheckboxState]);

  // Save side panel state
  useEffect(() => {
    saveSidePanelState('intro', sidePanelOpen);
  }, [sidePanelOpen]);

  const sidePanelContent = (
    <>
      <h2>{t.introEditor.sidePanel.title}</h2>
      <p className="panel-intro">{t.introEditor.sidePanel.intro}</p>

      <EssentialSection note={t.introEditor.sidePanel.essentialNote}>
        <CheckboxItem
          checked={checkDated}
          onChange={setCheckDated}
          label={t.introEditor.sidePanel.checkboxes.dated.title}
          description={t.introEditor.sidePanel.checkboxes.dated.description}
          essential
          readonly={hasDateTimeInline}
        />
        <CheckboxItem
          checked={checkQuorum}
          onChange={setCheckQuorum}
          label={t.introEditor.sidePanel.checkboxes.quorum.title}
          description={t.introEditor.sidePanel.checkboxes.quorum.description}
          essential
          readonly={hasQuorumInline}
        />
        <CheckboxItem
          checked={checkOpeningConditions}
          onChange={setCheckOpeningConditions}
          label={t.introEditor.sidePanel.checkboxes.openingConditions.title}
          description={t.introEditor.sidePanel.checkboxes.openingConditions.description}
          essential
          readonly={hasConditionsBlock}
        />
        <CheckboxItem
          checked={checkSecretHolders}
          onChange={setCheckSecretHolders}
          label={t.introEditor.sidePanel.checkboxes.secretHolders.title}
          description={t.introEditor.sidePanel.checkboxes.secretHolders.description}
          essential
          readonly={hasRecipientsBlock}
        />
        <CheckboxItem
          checked={checkAuthorIdentity}
          onChange={setCheckAuthorIdentity}
          label={t.introEditor.sidePanel.checkboxes.authorIdentity.title}
          description={t.introEditor.sidePanel.checkboxes.authorIdentity.description}
          essential
        />
      </EssentialSection>

      <div className="optional-section">
        <CheckboxItem
          checked={checkDirectives}
          onChange={setCheckDirectives}
          label={t.introEditor.sidePanel.checkboxes.directives.title}
          description={t.introEditor.sidePanel.checkboxes.directives.description}
        />
      </div>
    </>
  );

  return (
    <EditorLayout
      title={t.introEditor.title}
      subtitle={t.introEditor.subtitle}
      sidePanelOpen={sidePanelOpen}
      collapseLabel={t.introEditor.sidePanel.collapse}
      expandLabel={t.introEditor.sidePanel.expand}
      wideSidePanel
      onToggleSidePanel={() => setSidePanelOpen(!sidePanelOpen)}
      editorId="intro"
      sidePanelContent={sidePanelContent}
      toolbar={
        <RichTextToolbar 
          editor={editorInstanceRef.current} 
          editorVersion={editorVersion} 
          labels={t.introEditor.toolbar} 
          threshold={threshold} 
        />
      }
    >
      <div className="tiptap-editor" ref={editorRef}></div>

      <ActionButtons
        backLabel={t.common.back}
        continueLabel={buttonText}
        buttonState={buttonState}
        disabled={!hasContent}
        onBack={handleBack}
        onContinue={handleContinue}
        showAlternative={!hasContent}
        alternativeLabel={t.introEditor.sidePanel.generateExample}
        onAlternative={generateExample}
      />
    </EditorLayout>
  );
}

export default IntroMessageEditor;
