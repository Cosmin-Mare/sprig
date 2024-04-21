import {
	createEditorState,
	initialExtensions,
	diagnosticsFromErrorLog,
} from "../lib/codemirror/init";
import { useEffect, useRef, useState } from "preact/hooks";
import { StateEffect } from "@codemirror/state";
import styles from "./codemirror.module.css";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { isDark, errorLog } from "../lib/state";
import { Diagnostic, setDiagnosticsEffect } from "@codemirror/lint";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { yCollab } from "y-codemirror.next";
import { symbol } from "astro/zod";

interface CodeMirrorProps {
	id?: string | undefined;
	class?: string | undefined;
	initialCode?: string;
	onCodeChange?: () => void;
	onRunShortcut?: () => void;
	onEditorView?: (editor: EditorView) => void;
}

export default function CodeMirror(props: CodeMirrorProps) {
	const parent = useRef<HTMLDivElement>(null);
	const [editorRef, setEditorRef] = useState<EditorView>();
	const [yCollabExtension, setYCollabExtension] = useState<any>();

	// Alert the parent to code changes (not reactive)
	const onCodeChangeRef = useRef(props.onCodeChange);
	useEffect(() => {
		onCodeChangeRef.current = props.onCodeChange;
	}, [props.onCodeChange]);

	// Run button
	const onRunShortcutRef = useRef(props.onRunShortcut);
	useEffect(() => {
		onRunShortcutRef.current = props.onRunShortcut;
	}, [props.onRunShortcut]);

	let lastCode: string | undefined = props.initialCode ?? "";
	// serves to restore config before dark mode was added
	const restoreInitialConfig = () =>
		initialExtensions(
			() => {
				if (editorRef?.state.doc.toString() === lastCode) return;
				lastCode = editorRef?.state.doc.toString();
				onCodeChangeRef.current?.();
			},
			() => onRunShortcutRef.current?.(),
			yCollabExtension
		);

	const setEditorTheme = () => {
		if (isDark.value) {
			editorRef?.dispatch({
				effects: StateEffect.appendConfig.of(oneDark),
			});
		} else
			editorRef?.dispatch({
				effects: StateEffect.reconfigure.of(restoreInitialConfig()),
			});
	};
	useEffect(() => {
		if (!parent.current)
			throw new Error("Oh golly! The editor parent ref is null");
		if (props.id !== undefined && props.id !== null) {
			console.log(props.id);
			const yDoc = new Y.Doc();
			const provider = new WebrtcProvider(props.id, yDoc, {
				signaling: [
					"wss://yjs-signaling-server-5fb6d64b3314.herokuapp.com",
				],
			});
			//get yjs document from provider
			let ytext = yDoc.getText("codemirror");
			const yUndoManager = new Y.UndoManager(ytext);

			provider.awareness.setLocalStateField("user", {
				name: "Anonymous" + Math.floor(Math.random() * 1000),
			});
			let yCollabExtension = yCollab(ytext, provider.awareness, {
				undoManager: yUndoManager,
			});
			setYCollabExtension(yCollabExtension);
			//get the initial code from the yjs document

			// Wait for document state to be received from provider
			let initialUpdate = true;

			const waitInitialUpdate = function () {
				return new Promise<void>((resolve) => {
					let timer: NodeJS.Timeout;
					const checkUpdated = () => {
						console.log(provider.awareness.getStates().size);
						if (initialUpdate === false) {
							clearTimeout(timer);
							resolve();
						} else {
							setTimeout(checkUpdated, 500);
						}
					};
					timer = setTimeout(() => {
						clearTimeout(timer);
						resolve();
					}, 1500);

					checkUpdated();
				});
			};
			waitInitialUpdate().then(() => {
				if (ytext.toString() === "") {
					ytext.insert(0, props.initialCode ?? "");
				}
				if (!parent.current)
					throw new Error("Oh golly! The editor parent ref is null");

				const editor = new EditorView({
					state: createEditorState(
						ytext.toString(),
						() => {
							if (editor.state.doc.toString() === lastCode)
								return;
							lastCode = editor.state.doc.toString();
							onCodeChangeRef.current?.();
						},
						() => onRunShortcutRef.current?.(),
						yCollabExtension
					),
					parent: parent.current,
				});
				setEditorRef(editor);
				props.onEditorView?.(editor);
			});
			yDoc.on("update", () => {
				// Only trigger on the first update
				if (!initialUpdate) return;
				ytext = yDoc.getText("codemirror");
				initialUpdate = false;
			});
		} else {
			const editor = new EditorView({
				state: createEditorState(
					props.initialCode ? props.initialCode : "",
					() => {
						if (editor.state.doc.toString() === lastCode) return;
						lastCode = editor.state.doc.toString();
						onCodeChangeRef.current?.();
					},
					() => onRunShortcutRef.current?.()
				),
				parent: parent.current,
			});

			setEditorRef(editor);
			props.onEditorView?.(editor);
		}
	}, []);

	useEffect(() => {
		setEditorTheme();
	}, [isDark.value, editorRef]);

	useEffect(() => {
		errorLog.subscribe((value) => {
			const diagnostics = diagnosticsFromErrorLog(
				editorRef as EditorView,
				value
			);
			editorRef?.dispatch({
				effects: setDiagnosticsEffect.of(diagnostics as Diagnostic[]),
			});
		});
	}, [editorRef]);

	return (
		<div
			class={`${styles.container} ${
				editorRef === undefined
					? isDark.value
						? styles.containerSkeletonDark
						: styles.containerSkeleton
					: ""
			} ${props.class ?? ""}`}
			ref={parent}
		/>
	);
}
