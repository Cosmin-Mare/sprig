import Button from "../design-system/button";
import styles from "./participants-popup.module.css";

interface ParticipantsPopupProps {
	onClose: () => void;
}

export default function ParticipantsPopup(props: ParticipantsPopupProps) {
	return (
		<div class={styles.participantsPopup}>
			<Button class={styles.warningButton}>End room</Button>
			<Button class={styles.warningButton}>Leave</Button>

			<div>
				<h2>Participants</h2>
				<p>There are no participants in this room.</p>
			</div>
		</div>
	);
}
