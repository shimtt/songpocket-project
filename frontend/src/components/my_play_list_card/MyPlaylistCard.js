import React from 'react';
import './MyPlaylistCard.css';
import { FaTrashAlt } from 'react-icons/fa';

const MyPlaylistCard = ({id, title, channel, youtubeThumbnail, youtubeUrl, onDelete, onClick}) => {
  const handleClick = () => {
    if (window.confirm('정말 삭제하시겠습니까?')){
      onDelete(id);
    }
  };

  return (
    <div className="playlist-card">
      <img 
        src={youtubeThumbnail} 
        alt={title} 
        className="playlist-thumbnail" 
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      />
      <div className="card-header">
        <p className="card-title"  title={title}>
          {title.length > 15 ? `${title.slice(0, 15)}...` : title}
        </p>
          <button 
            className="delete-icon-btn" 
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
          <FaTrashAlt />
        </button>
      </div>
    </div>
  );
};

export default MyPlaylistCard;