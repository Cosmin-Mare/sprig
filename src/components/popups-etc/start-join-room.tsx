import { IoClose } from "react-icons/io5";
import Button from "../design-system/button";
import Input from "../design-system/input";
import styles from "./start-join-room.module.css";

export interface StartJoinModalProps {
	closePopup: () => void;
}

export default function StartJoinModal(props: StartJoinModalProps) {
	return (
		<div class={`${styles.overlay} ${styles.split}`}>
			<div class={styles.modal}>
				<div class={styles.stack}>
					<h2>Start a room</h2>
					<p>
						Morbi facilisis, tortor ac eleifend dignissim, lectus mi
						maximus est, sit amet scelerisque enim ipsum non mauris.
						Ut pretium, odio et feugiat consectetur, quam libero
						ultrices nulla, mollis fringilla risus odio eget magna.
						Praesent aliquet velit sapien, scelerisque viverra augue
						tristique id.
					</p>
				</div>

				<form
					onSubmit={async (event) => {
						event.preventDefault();
					}}
					class={styles.stack}
				>
					<Button accent type="submit">
						Start a room
					</Button>
				</form>
			</div>
			<div class={styles.modal}>
				<Button class={styles.exitButton} onClick={props.closePopup}>
					X
				</Button>

				<div class={styles.stack}>
					<h2>Join a room</h2>
					<p>
						Morbi facilisis, tortor ac eleifend dignissim, lectus mi
						maximus est, sit amet scelerisque enim ipsum non mauris.
						Ut pretium, odio et feugiat consectetur, quam libero
						ultrices nulla, mollis fringilla risus odio eget magna.
						Praesent aliquet velit sapien, scelerisque viverra augue
						tristique id.
					</p>
				</div>

				<form
					onSubmit={async (event) => {
						event.preventDefault();
					}}
					class={styles.stack}
				>
					<Input placeholder="Room code" />
				</form>
			</div>
			<button class={styles.close}>
				<IoClose />
			</button>
		</div>
	);
}
