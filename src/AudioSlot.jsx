import React,{useState,useEffect} from 'react'

const AudioSlot = ({ slotNumber }) => {
    const [isRecording, setIsRecording] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [duration, setDuration] = React.useState(0);
    const [singleLoop, setSingleLoop] = React.useState(false);
    const [loopForever, setLoopForever] = React.useState(false);
    const [audioBlob, setAudioBlob] = React.useState(null);
  
    const mediaRecorderRef = React.useRef(null);
    const audioContextRef = React.useRef(null);
    const audioBufferRef = React.useRef(null);
    const timerRef = React.useRef(null);
  
    React.useEffect(() => {
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, []);
  
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        const chunks = [];
  
        mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
          setAudioBlob(blob);
        };
  
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setDuration(0);
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };
  
    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        clearInterval(timerRef.current);
      }
    };
  
    const playAudio = async () => {
      if (!audioBlob) return;
  
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
  
        if (!audioBufferRef.current) {
          const arrayBuffer = await audioBlob.arrayBuffer();
          audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        }
  
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.connect(audioContextRef.current.destination);
  
        const playOnce = () => {
          setIsPlaying(true);
          source.start(0);
          setDuration(0);
          timerRef.current = setInterval(() => {
            setDuration((prev) => prev + 1);
          }, 1000);
  
          source.onended = () => {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            if (singleLoop) {
              playOnce();
              setSingleLoop(false);
            } else if (loopForever) {
              playOnce();
                
            }
          };
        };
  
        playOnce();
      } catch (err) {
        console.error('Error playing audio:', err);
      }
    };
  
    const clearAudio = () => {
      setAudioBlob(null);
      setDuration(0);
      audioBufferRef.current = null;
    };
  
    const getStatusColor = () => {
      if (isRecording) return 'bg-red-500';
      if (isPlaying) return 'bg-green-500';
      return 'bg-gray-500';
    };
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Slot {slotNumber}</h2>
        <div className="flex items-center mb-4">
          <div className={`w-4 h-4 rounded-full ${getStatusColor()} mr-2`}></div>
          <span className="font-mono">{duration}s</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={startRecording}
            disabled={isRecording || isPlaying}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Record
          </button>
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:bg-red-300"
          >
            Stop
          </button>
          <button
            onClick={playAudio}
            disabled={isRecording || isPlaying || !audioBlob}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-green-300"
          >
            Play
          </button>
          <button
            onClick={clearAudio}
            disabled={isRecording || isPlaying}
            className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:bg-yellow-300"
          >
            Clear
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={singleLoop}
              onChange={(e) => setSingleLoop(e.target.checked)}
              className="mr-2"
            />
            Single Loop
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={loopForever}
              onChange={(e) => setLoopForever(e.target.checked)}
              className="mr-2"
            />
            Loop Forever
          </label>
        </div>
      </div>
    );
  };
  
  export default AudioSlot;
  