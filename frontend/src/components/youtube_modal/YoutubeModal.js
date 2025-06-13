import React from "react";
import YoutubePlayer from "../youtube_player/YoutubePlayer";
import './YoutubeModal.css';

const YoutubeModal = ({ isOpen, onClose, videoId }) => {
  if (!isOpen) return null;

  return (
    <div className="youtube-modal-overlay" onClick={onClose}>
      <div className="youtube-modal-content" onClick={e => e.stopPropagation()}>
        <button className="youtube-modal-close" onClick={onClose}>닫기</button>
        <YoutubePlayer videoId={videoId} />
      </div>
    </div>
  )
}

export default YoutubeModal;