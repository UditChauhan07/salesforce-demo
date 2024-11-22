import React, { useRef, useState, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ src }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const video = videoRef.current;

        const updateTime = () => {
            setProgress((video.currentTime / video.duration) * 100);
            setCurrentTime(video.currentTime);
        };

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', () => {
            setDuration(video.duration);
        });

        return () => {
            video.removeEventListener('timeupdate', updateTime);
        };
    }, []);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        const newTime = percent * videoRef.current.duration;
        videoRef.current.currentTime = newTime;
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="video-container">
            <video ref={videoRef} className="video" src={src} />
            <div className="custom-controls">
                <button className="play-btn" onClick={togglePlayPause}>
                    {isPlaying ? '⏸️' : '▶️'}
                </button>
                <button className="mute-btn" onClick={toggleMute}>
                    {isMuted ? '🔇' : '🔊'}
                </button>
                <div className="progress-container" onClick={handleProgressClick}>
                    <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="time">{formatTime(currentTime)}</span>/
                <span className="time">{formatTime(duration)}</span>
            </div>
        </div>
    );
};

export default VideoPlayer;
