import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  url: string;
  poster?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, poster, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (url.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        return () => hls.destroy();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    } else {
      video.src = url;
    }
  }, [url]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls
      autoPlay
      playsInline
      className={className}
    />
  );
};
