import './App.css';
import jsonData from './data.json';
import React, { useEffect, useRef, useState } from 'react';
import 'antd/dist/antd.css';
import { Input, Slider } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const { Search } = Input;
const MAX_LENGTH = 10;
const DEFAULT_ARTIST = "katy perry";
const DEFAULT_START = 2015;
const DEFAULT_END = 2021;

const borderColors = [
  'rgb(255, 99, 132)',
  'rgb(255, 159, 64)',
  'rgb(255, 205, 86)',
  'rgb(75, 192, 192)',
  'rgb(54, 162, 235)',
  'rgb(153, 102, 255)',
  'rgb(201, 203, 207)'
];

const backgroundColors = [
  'rgb(255, 99, 132, 0.5)',
  'rgb(255, 159, 64, 0.5)',
  'rgb(255, 205, 86, 0.5)',
  'rgb(75, 192, 192, 0.5)',
  'rgb(54, 162, 235, 0.5)',
  'rgb(153, 102, 255, 0.5)',
  'rgb(201, 203, 207, 0.5)'
];


export default function App() {
  const chart = useRef(null);
  const intervalRef = useRef(null);
  const [artist, setArtist] = useState(DEFAULT_ARTIST);
  const [start, setStart] = useState(DEFAULT_START)
  const [end, setEnd] = useState(DEFAULT_END);

  const selectedData = jsonData.filter(data => {
    const year = parseInt(data['date'].substring(0, 4), 10)
    return year >= start && year <= end;
  }).reverse()
  

  const filteredData = [];
  const songsByArtist = new Set()

  selectedData.forEach(temp => {
    if (temp['artist'].toUpperCase().includes(artist.toUpperCase())) {
      songsByArtist.add(temp['song'])
      filteredData.push(temp)
    }
  })

  

  const tempMap = filteredData.reduce((acc, curValue) => {
    if (!(curValue['date'] in acc)) {
      acc[curValue['date']] = {}
    }
    acc[curValue['date']][curValue['rank']] ={
      'song': curValue['song'],
      'artist': curValue['artist']
    };  
    return acc;
  }, {})

  const allDate = Object.keys(tempMap);
  const allSongData = {};
  
  
  const datasets = Array.from(songsByArtist).map((song, index) => {
    const songData = allDate.map(date => {
      const topSongs = tempMap[date]
      const isTopSongs = Object.entries(topSongs).find(topSong => topSong[1]['song'] === song)
      
      return isTopSongs == undefined ? null : isTopSongs[0]
    })
    allSongData[song] = songData;

    return {
      label: song,
      data: songData.slice(0, MAX_LENGTH),
      borderColor: borderColors[index % borderColors.length],
      backgroundColor: backgroundColors[index % backgroundColors.length],
      tension: 0.3,
    }
  })
  
  
  const data = {
    datasets,
    labels: allDate.slice(0, MAX_LENGTH)
  }

  const options = {
    animation: {
      easing: 'linear'
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Songs by ${artist} from ${start} to ${end}`,
      },
    },
    scales: {
      // x: {
      //   type: 'time',
      //   time: {
      //     parser: 'YYYY-MM-DD',
      //     unit: 'day',
      //     displayFormats: {
      //       'day': 'MM/DD/YYYY'
      //     },
    
      //   }
      // },
      y: {
        reverse: true,
        min: 1,
        max: 100,
      }
    }
  };
  

  
  
  
  
  useEffect(() => {
    if (allDate.length > MAX_LENGTH) {
      const interval = setInterval(() => {
        data['labels'].shift();
        data['labels'].push(allDate[MAX_LENGTH + 1]);
        allDate.shift();
        data.datasets.forEach(element => {
          element.data.shift();
          element.data.push(allSongData[element.label][MAX_LENGTH + 1])
          allSongData[element.label].shift();
        })

        
        chart.current.update();
        
  
        if (allDate.length <= MAX_LENGTH) {
          clearInterval(intervalRef.current)
        }
  
  
      }, 1000);
      intervalRef.current = interval
      return () => clearInterval(interval);
    }
    
  }, [artist, start, end]);




  return (
    <div className="container">
      <div className='title'>Billboard Hot 100 Songs by Artist</div>
      
      <div className="inputs">
        <div className='input'>
          <div className="label">Artist: </div>
          <Search 
            placeholder="Search an artist" 
            defaultValue={DEFAULT_ARTIST}
            style={{ width: 300 }}
            onSearch={newValue => {
              if (newValue === "") {
                return;
              }
              setArtist(newValue)
          }} />
        </div>
        <div className='input'>
          <div className="label">Years: </div>
          <div className="slider">
            <Slider 
              range 
              defaultValue={[DEFAULT_START, DEFAULT_END]} 
              min={2000} 
              max={2021} 
              marks={{2000: '2000', 2021: '2021'}}
              onAfterChange={newValue => {
                setStart(newValue[0])
                setEnd(newValue[1])
              }}
            />
          </div>
        </div>
      </div>
      <div className='chart'>
        <Line options={options} data={data} ref={chart} />
      </div>
    </div>
  );
}
