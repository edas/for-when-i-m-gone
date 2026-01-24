import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Editor, JSONContent } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { computeButtonState, getButtonText } from '../../lib/buttonState';
import { useData } from '../../lib/DataContext';
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
import type { Recipient } from '../../lib/types/recipient';
import { EditorLayout } from '../ui/EditorLayout';
import { CheckboxItem } from '../ui/CheckboxItem';
import { ActionButtons } from '../ui/ActionButtons';
import { EssentialSection } from '../ui/EssentialSection';
import { HelpSection } from '../ui/HelpSection';
import { RichTextToolbar } from '../ui/RichTextToolbar';
import '../../styles/tiptap-editor.css';
import styles from './IntroMessageEditor.module.css';

interface IntroMessageEditorProps {
  initialValue?: JSONContent | null;
  initialCheckboxState?: IntroCheckboxState;
  threshold: number;
  conditions?: JSONContent | null;
  recipients?: Recipient[];
  onContinue: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
  onBack: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
}

export function IntroMessageEditor({ 
  initialValue, 
  initialCheckboxState, 
  threshold, 
  conditions, 
  recipients, 
  onContinue, 
  onBack 
}: IntroMessageEditorProps) {
  const { updateStoredData } = useData();
  const { t, i18n } = useTranslation();

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
  const buttonTexts = useMemo(() => ({
    continueWithoutConfirm: t('introEditor.buttons.continueWithoutConfirm'),
    continueWithoutEssentials: t('introEditor.buttons.continueWithoutEssentials'),
    continue: t('introEditor.buttons.continue'),
  }), [t]);
  const buttonText = useMemo(() => getButtonText(buttonState, buttonTexts), [buttonState, buttonTexts]);

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
    // Get example content from i18next resources
    const exampleContent = t('introEditor.sidePanel.exampleContentJson', { returnObjects: true }) as JSONContent;

    generateExampleInEditor(editor, exampleContent, hasContent);
    
    setMessageJson(editor.getJSON());
    setEditorVersion(v => v + 1);
  }, [t, hasContent]);

  const contactTypeLabels = useMemo(() => {
    return {
      phone: t('whoEditor.contactTypes.phone'),
      email: t('whoEditor.contactTypes.email'),
      address: t('whoEditor.contactTypes.address'),
      x: t('whoEditor.contactTypes.x'),
      bluesky: t('whoEditor.contactTypes.bluesky'),
      mastodon: t('whoEditor.contactTypes.mastodon'),
      facebook: t('whoEditor.contactTypes.facebook'),
      telegram: t('whoEditor.contactTypes.telegram'),
      whatsapp: t('whoEditor.contactTypes.whatsapp'),
      signal: t('whoEditor.contactTypes.signal'),
      instagram: t('whoEditor.contactTypes.instagram'),
      snapchat: t('whoEditor.contactTypes.snapchat'),
      linkedin: t('whoEditor.contactTypes.linkedin'),
      web: t('whoEditor.contactTypes.web'),
      other: t('whoEditor.contactTypes.other'),
    };
  }, [t]);

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
      lang: i18n.language as 'fr' | 'en',
      contactTypeLabels,
    });
  }, [recipients, conditions, threshold, i18n.language, contactTypeLabels]);

  const toolbarLabels = useMemo(() => ({
    heading: t('introEditor.toolbar.heading'),
    paragraph: t('introEditor.toolbar.paragraph'),
    bold: t('introEditor.toolbar.bold'),
    italic: t('introEditor.toolbar.italic'),
    underline: t('introEditor.toolbar.underline'),
    bulletList: t('introEditor.toolbar.bulletList'),
    numberedList: t('introEditor.toolbar.numberedList'),
    insertRecipients: t('introEditor.toolbar.insertRecipients'),
    insertConditions: t('introEditor.toolbar.insertConditions'),
    insertDateTime: t('introEditor.toolbar.insertDateTime'),
    insertQuorum: t('introEditor.toolbar.insertQuorum'),
  }), [t]);

  // Initialize TipTap editor
  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      const newEditor = createTiptapEditor({
        element: editorRef.current,
        content: initialContent,
        placeholder: t('introEditor.placeholder'),
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
  }, [t]);

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
  }, [messageJson, getCurrentCheckboxState, updateStoredData]);

  const helpContent = (
    <>
      <p className="panel-intro">{t('introEditor.sidePanel.intro')}</p>

      <EssentialSection note={t('introEditor.sidePanel.essentialNote')}>
        <CheckboxItem
          checked={checkDated}
          onChange={setCheckDated}
          label={t('introEditor.sidePanel.checkboxes.dated.title')}
          description={t('introEditor.sidePanel.checkboxes.dated.description')}
          essential
          readonly={hasDateTimeInline}
        />
        <CheckboxItem
          checked={checkQuorum}
          onChange={setCheckQuorum}
          label={t('introEditor.sidePanel.checkboxes.quorum.title')}
          description={t('introEditor.sidePanel.checkboxes.quorum.description')}
          essential
          readonly={hasQuorumInline}
        />
        <CheckboxItem
          checked={checkOpeningConditions}
          onChange={setCheckOpeningConditions}
          label={t('introEditor.sidePanel.checkboxes.openingConditions.title')}
          description={t('introEditor.sidePanel.checkboxes.openingConditions.description')}
          essential
          readonly={hasConditionsBlock}
        />
        <CheckboxItem
          checked={checkSecretHolders}
          onChange={setCheckSecretHolders}
          label={t('introEditor.sidePanel.checkboxes.secretHolders.title')}
          description={t('introEditor.sidePanel.checkboxes.secretHolders.description')}
          essential
          readonly={hasRecipientsBlock}
        />
        <CheckboxItem
          checked={checkAuthorIdentity}
          onChange={setCheckAuthorIdentity}
          label={t('introEditor.sidePanel.checkboxes.authorIdentity.title')}
          description={t('introEditor.sidePanel.checkboxes.authorIdentity.description')}
          essential
        />
      </EssentialSection>

      <div className="optional-section">
        <CheckboxItem
          checked={checkDirectives}
          onChange={setCheckDirectives}
          label={t('introEditor.sidePanel.checkboxes.directives.title')}
          description={t('introEditor.sidePanel.checkboxes.directives.description')}
        />
      </div>
    </>
  );

  return (
    <EditorLayout
      title={t('introEditor.title')}
      subtitle={t('introEditor.subtitle')}
      toolbar={
        <RichTextToolbar 
          editor={editorInstanceRef.current} 
          editorVersion={editorVersion} 
          labels={toolbarLabels} 
          threshold={threshold} 
        />
      }
    >
      <div className={`tiptap-editor ${styles.tiptapEditor}`} ref={editorRef}></div>

      <HelpSection title={t('introEditor.sidePanel.title')}>
        {helpContent}
      </HelpSection>

      <ActionButtons
        backLabel={t('common.back')}
        continueLabel={buttonText}
        buttonState={buttonState}
        disabled={!hasContent}
        onBack={handleBack}
        onContinue={handleContinue}
        showAlternative={!hasContent}
        alternativeLabel={t('introEditor.sidePanel.generateExample')}
        onAlternative={generateExample}
      />
    </EditorLayout>
  );
}

export default IntroMessageEditor;
