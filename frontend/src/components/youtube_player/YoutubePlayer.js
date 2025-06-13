import React from 'react';

const YoutubePlayer =({ videoId }) => {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="youtube-player">
      <iframe
        width="100%"
        height="315"
        src={embedUrl}
        title="Youtube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}

export default YoutubePlayer;