// pages/Form.jsx
import React, { useState } from 'react';
import dataSet from '../../DataSet/DataSet.geojson';
import DynamicButton from '../components/DynamicButton';

const Form = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const locations = dataSet.features.map((feature) => feature.properties.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("From:", from, "To:", to);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium">From:</label>
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Start</option>
          {locations.map((loc, index) => (
            <option key={index} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">To:</label>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Destination</option>
          {locations.map((loc, index) => (
            <option key={index} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="pt-2">
        <DynamicButton label="Find Ways" onClick={handleSubmit} color="green" />
      </div>
    </form>
  );
};

export default Form;
