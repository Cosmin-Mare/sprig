import Button from "../design-system/button";
import Input from "../design-system/input";
import styles from "./room-popup.module.css";
interface RoomPopupProps {
	onClose: () => void;
}
export default function RoomPopup(props: RoomPopupProps) {
	return (
		<div class={styles.overlay}>
			<div class={styles.modal}>
				<h2>Start room</h2>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit.
					Vivamus auctor, nunc mattis fermentum elementum, augue erat
					venenatis tellus, sed sollicitudin dolor sapien sit amet
					est. Vestibulum at arcu vestibulum erat fermentum bibendum
					id vitae diam. Lorem ipsum dolor sit amet, consectetur
					adipiscing elit.
				</p>
				<Button class={styles.primary}>Start</Button>
			</div>
			<div class={styles.modal}>
				<h2>Join room</h2>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit.
					Vivamus auctor, nunc mattis fermentum elementum, augue erat
					venenatis tellus, sed sollicitudin dolor sapien sit amet
					est. Vestibulum at arcu vestibulum erat fermentum bibendum
					id vitae diam. Lorem ipsum dolor sit amet, consectetur
					adipiscing elit.
				</p>
				<Input placeholder="Room name" />
				<Button class={styles.primary}>Join</Button>
			</div>
			<div class={styles.closeButtonContainer}>
				<Button onClick={props.onClose} class={styles.closeButton}>
					X
				</Button>
			</div>
		</div>
	);
}
