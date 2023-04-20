import Draggable from 'react-draggable';
import styles from './index.module.scss';
export default function index(props: any) {
  return (
    <Draggable
    // onStart={() => {
    //   setDragging(true);
    // }}
    // onDrag={(e, position) => {
    //   setPosition(position);
    // }}
    // onStop={(e, position) => {
    //   handleDragBoundary(e, position);
    // setDragging(false);
    // }}
    // handle=".windowHeader"
    // nodeRef={dragDom}
    // position={position}
    >
      <div className={styles.container}>
        <div className={styles.floatBtn}>
          <div className={styles.innerBtn}>
            <div className={styles.centerBtn}></div>
          </div>
        </div>
        <div className={styles.expand}></div>
      </div>
    </Draggable>
  );
}
