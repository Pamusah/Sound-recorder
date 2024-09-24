import React from 'react';
import AudioSlot from './AudioSlot';

const App = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Sound Recorder UI</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((slotNumber) => (
          <AudioSlot key={slotNumber} slotNumber={slotNumber} />
        ))}
      </div>
    </div>
  );
};

export default App;
