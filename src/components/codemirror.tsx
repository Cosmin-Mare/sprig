import {
	createEditorState,
	initialExtensions,
	diagnosticsFromErrorLog,
} from "../lib/codemirror/init";
import { useEffect, useRef, useState } from "preact/hooks";
import { StateEffect } from "@codemirror/state";
import styles from "./codemirror.module.css";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, ViewPlugin } from "@codemirror/view";
import { isDark, errorLog, PersistenceState } from "../lib/state";
import { Diagnostic, setDiagnosticsEffect } from "@codemirror/lint";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { yCollab } from "y-codemirror.next";
import { symbol } from "astro/zod";
import { Signal } from "@preact/signals";
import { getGame } from "../lib/game-saving/account";
import shortUUID from "short-uuid";

interface CodeMirrorProps {
	roomId: string | null;
	setRoomId: (roomId: string) => void;
	isInRoom: boolean;
	setIsConnectedToRoom: (isConnected: boolean) => void;
	persistenceState: Signal<PersistenceState>;
	class?: string | undefined;
	initialCode?: string;
	onCodeChange?: () => void;
	onRunShortcut?: () => void;
	onEditorView?: (editor: EditorView) => void;
	setRoomParticipants: (participants: string[]) => void;
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

	useEffect(() => {
		if (props.isInRoom) {
			if (props.persistenceState.value.session == null) {
				props.setRoomId(shortUUID().generate());
			} else if (props.persistenceState.value.session.session.full) {
				let ownerId =
					props.persistenceState.value.kind === "PERSISTED" &&
					props.persistenceState.value.game !== "LOADING" &&
					props.persistenceState.value.game.ownerId;
				let gameId =
					props.persistenceState.value.kind === "PERSISTED" &&
					props.persistenceState.value.game !== "LOADING" &&
					props.persistenceState.value.game.id;

				if (!ownerId || !gameId) return; //TODO: make a popup
				if (props.persistenceState.value.session.user.id == ownerId) {
					props.setRoomId(gameId);
				} else {
					//TODO: make a popup
				}
			}
		}
	}, [props.isInRoom]);

	useEffect(() => {
		if (props.roomId !== null) {
			props.setRoomId(props.roomId);
		}
	});

	useEffect(() => {
		if (props.roomId === null) return;

		const yDoc = new Y.Doc();
		const provider = new WebrtcProvider(props.roomId, yDoc, {
			signaling: [
				"wss://yjs-signaling-server-5fb6d64b3314.herokuapp.com",
			],
		});
		//get yjs document from provider
		let ytext = yDoc.getText("codemirror");
		const yUndoManager = new Y.UndoManager(ytext);

		provider.awareness.setLocalStateField("user", {
			name:
				props.persistenceState.value.session?.user.username ??
				"Anonymous",
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
				ytext.insert(0, lastCode ?? "");
			}
			if (!parent.current)
				throw new Error("Oh golly! The editor parent ref is null");

			editorRef?.dispatch({
				effects: StateEffect.appendConfig.of(yCollabExtension),
				changes: {
					from: 0,
					to: editorRef.state.doc.length,
					insert: ytext.toString(),
				},
			});
			console.log(props.roomId);

			// const editor = new EditorView({
			// 	state: createEditorState(
			// 		ytext.toString(),
			// 		() => {
			// 			if (editor.state.doc.toString() === lastCode) return;
			// 			lastCode = editor.state.doc.toString();
			// 			onCodeChangeRef.current?.();
			// 		},
			// 		() => onRunShortcutRef.current?.(),
			// 		yCollabExtension
			// 	),
			// 	parent: parent.current,
			// });

			// setEditorRef(editor);
			// props.onEditorView?.(editor);
		});
		yDoc.on("update", () => {
			// Only trigger on the first update
			let participants = provider.awareness.getStates();
			let participantsArray = [];
			for (let [, value] of participants) {
				participantsArray.push(value.user.name);
			}
			props.setRoomParticipants(participantsArray);
			props.setIsConnectedToRoom(true);
			if (!initialUpdate) return;
			ytext = yDoc.getText("codemirror");
			initialUpdate = false;
		});
	}, [props.roomId]);

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
		if (props.roomId !== undefined && props.roomId !== null) {
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
