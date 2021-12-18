import './App.css';
import jsonData from './data.json';
import React, { useEffect, useRef } from 'react';
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
      text: 'Chart.js Line Chart',
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
  const maxLength = 10;
  
  const chart = useRef(null);
  const tempData = jsonData.slice(0, 2000).reverse()
  

  const filteredData = [];
  // const artist = 'olivia rodrigo'
  const artist = 'doja cat'
  const songsByArtist = new Set()

  tempData.forEach(temp => {
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
      data: songData.slice(0, maxLength),
      borderColor: borderColors[index % borderColors.length],
      backgroundColor: backgroundColors[index % backgroundColors.length],
      tension: 0.3,
    }
  })
  
  
  const data = {
    datasets,
    labels: allDate.slice(0, maxLength)
  }

  
  
  
  
  const intervalRef = useRef(null);
  useEffect(() => {
    if (allDate.length > maxLength) {
      const interval = setInterval(() => {
        data['labels'].shift();
        data['labels'].push(allDate[maxLength + 1]);
        allDate.shift();
        data.datasets.forEach(element => {
          element.data.shift();
          element.data.push(allSongData[element.label][maxLength + 1])
          allSongData[element.label].shift();
        })

        
        chart.current.update();
        
  
        if (allDate.length <= maxLength) {
          clearInterval(intervalRef.current)
        }
  
  
      }, 1000);
      intervalRef.current = interval
      return () => clearInterval(interval);
    }
    
  }, []);

  


  return <div className="wrapper"><Line options={options} data={data} ref={chart} /></div>;
}
