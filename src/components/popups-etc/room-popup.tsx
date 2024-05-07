import { useSignal } from "@preact/signals";
import Button from "../design-system/button";
import Input from "../design-system/input";
import styles from "./room-popup.module.css";

interface RoomPopupProps {
	roomId: string | null;
	participants: string[];
	isConnected: boolean;
	onClose: () => void;
}

export default function RoomPopup(props: RoomPopupProps) {
	const copied = useSignal(false);
	if (props.roomId === null) {
		return (
			<div class={styles.overlay}>
				<div class={styles.modal}>
					<h1>Could not connect to a room. Refresh and try again</h1>
				</div>
			</div>
		);
	}
	function copyLink() {
		if (!props.roomId) return;
		navigator.clipboard.writeText(
			`https://sprig.hackclub.com/editor/${props.roomId}`
		);
		copied.value = true;
	}

	return (
		<div class={styles.overlay}>
			<div class={styles.modal}>
				<h1>
					{props.isConnected ? "Connected " : "Connecting "}to room{" "}
					{props.roomId}
				</h1>
				<p>Participants:</p>
				{props.participants ? (
					<ul class={styles.participantsList}>
						{props.participants.map((participant) => (
							<li class={styles.participant}>{participant}</li>
						))}
					</ul>
				) : (
					<p>None</p>
				)}
				<Button class={styles.closeBtn} onClick={props.onClose}>
					Close
				</Button>
				<p>
					Share this link for others to join:{" "}
					<a href="javascript:void" onClick={copyLink}>
						https://sprig.hackclub.com/editor/{props.roomId}
					</a>{" "}
				</p>
				<Button accent onClick={copyLink}>
					Click to copy
				</Button>
				{copied.value && <p>Copied!</p>}
			</div>
		</div>
	);
}
