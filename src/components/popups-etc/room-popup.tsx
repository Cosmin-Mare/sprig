import styles from "./room-popup.module.css";

interface RoomPopupProps {
	roomId: string | null;
	participants: string[];
	isConnected: boolean;
}

export default function RoomPopup(props: RoomPopupProps) {
	return (
		<div class={styles.overlay}>
			<div class={styles.modal}>
				<h1>
					{props.isConnected ? "Connected " : "Connecting "}to room{" "}
					{props.roomId}
				</h1>
				<p>Participants:</p>
				{props.participants ? (
					<ul>
						{props.participants.map((participant) => (
							<li>{participant}</li>
						))}
					</ul>
				) : (
					<p>None</p>
				)}
			</div>
		</div>
	);
}
