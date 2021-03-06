import React, { Component } from 'react';
import albumData from './../data/albums';
import PlayerBar from './PlayerBar';

class Album extends Component {
    constructor(props) {
        super(props);

        const album = albumData.find( album => {
            return album.slug === this.props.match.params.slug
        });

        this.state = {
            album: album,
            isPlaying: false,
            currentSong: null,
            currentTime: 0,
            duration: album.songs[0].duration,
            currentVolume: 0,
            songHovered: null
        };

        this.audioElement = document.createElement('audio');
        this.audioElement.src = album.songs[0].audioSrc;
    }

    componentDidMount() {
        this.eventListeners = {
            timeupdate: e => {
                const display = this.formatTime(this.audioElement.currentTime);
                this.setState({ currentTime: this.audioElement.currentTime });
            },
            durationchange: e => {
                this.setState({ duration: this.audioElement.duration });
            },
            volumechange: e => {
                this.setState({ currentVolume: this.audioElement.volume });
            }
        };
        this.audioElement.addEventListener('timeupdate', this.eventListeners.timeupdate);
        this.audioElement.addEventListener('durationchange', this.eventListeners.durationchange);
        this.audioElement.addEventListener('volumechange', this.eventListeners.volumechange);
    }

    componentWillUnmount() {
        this.audioElement.src = null;
        this.audioElement.removeEventListener('timeupdate', this.eventListeners.timeupdate);
        this.audioElement.removeEventListener('durationchange', this.eventListeners.durationchange);
        this.audioElement.removeEventListener('volumechange', this.eventListeners.volumechange);
    }

    play() {
        this.audioElement.play();
        this.setState({ isPlaying: true });
    }

    pause() {
        this.audioElement.pause();
        this.setState({
            isPlaying: false,
            currentSong: null
        });
    }

    setSong(song) {
        this.audioElement.src = song.audioSrc;
        this.setState({ currentSong: song });
    }

    handleSongClick(song) {
        const isSameSong = this.state.currentSong === song;
        if (this.state.isPlaying && isSameSong) {
            this.pause();
        } else {
            if (!isSameSong) { this.setSong(song); }    
            this.play();
        }
    }

    handleMouseEnter(song) {
        const index = this.state.album.songs.indexOf(song);
        this.setState( {songHovered: index} );
    }

    handleMouseLeave(song) {
        this.setState( {songHovered: null});
    }

    showIcon(song) {
        return (song === this.state.currentSong) ? 'ion-md-pause' : 'ion-md-play-circle';
    }

    handlePrevClick() {
       const currentIndex = this.state.album.songs.findIndex(song => this.state.currentSong === song);
       const newIndex = Math.max(0, currentIndex - 1);
       const newSong = this.state.album.songs[newIndex];
       this.setSong(newSong);
       this.play(); 
    }

    handleNextClick() {
        const currentIndex = this.state.album.songs.findIndex(song => this.state.currentSong === song);
        const newIndex = Math.max(0, currentIndex + 1);
        const newSong = this.state.album.songs[newIndex];
        this.setSong(newSong);
        this.play();
    }

    handleTimeChange(e) {
        const newTime = this.audioElement.duration * e.target.value;
        this.audioElement.currentTime = newTime;
        this.setState({ currentTime: newTime });
    }

    handleVolumeChange(e) {
        const newVolume = e.target.value;
        this.audioElement.volume = newVolume;
        this.setState({ currentVolume: newVolume });
    }

    formatTime(duration) {
        const minutes = Math.floor(duration / 60);
        const seconds = ('0' + Math.floor(duration - (minutes * 60))).slice(-2);
        return minutes + ':' + seconds;
    }
    
    render() {
        return (
            <section className="album">
                <section id="album-info">
                    <img id="album-cover-art" src={this.state.album.albumCover} alt={this.state.album.title}/>
                    <div className="album-details">
                        <h1 id="album-title">{this.state.album.title}</h1>
                        <h2 className="artist">{this.state.album.artist}</h2>
                        <div id="release-info">{this.state.album.releaseInfo}</div>
                    </div>
                </section>
                <table id="song-list">
                    <colgroup>
                        <col id="song-number-column" />
                        <col id="song-title-column" />
                        <col id="song-duration-column" />
                    </colgroup>
                    <tbody>
                        {this.state.album.songs.map( (song, index) =>
                                <tr className="song" key={index}
                                    onClick={() => this.handleSongClick(song)}
                                    onMouseEnter={() => this.handleMouseEnter(song)}
                                    onMouseLeave={() => this.handleMouseLeave()}
                                >
                                    <td>
                                        {index === this.state.songHovered ?
                                        <span className={this.showIcon(song)}></span> :
                                        <span>{index+1}</span>}
                                    </td>
                                    <td>{song.title}</td>
                                    <td>{song.duration}</td>
                                </tr>
                            )}
                    </tbody>
                </table>
                <PlayerBar
                    isPlaying={this.state.isPlaying} 
                    currentSong={this.state.currentSong}
                    currentTime={this.audioElement.currentTime}
                    duration={this.audioElement.duration}
                    currentVolume={this.audioElement.volume}
                    handleSongClick={() => this.handleSongClick(this.state.currentSong)}
                    handlePrevClick={() => this.handlePrevClick()}
                    handleNextClick={() => this.handleNextClick()}
                    handleTimeChange={(e) => this.handleTimeChange(e)}
                    handleVolumeChange={(e) => this.handleVolumeChange(e)}
                />
            </section>
        );
    }
}

export default Album;
