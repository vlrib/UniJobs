var axios = require('axios');

axios.defaults.baseURL = 'https://127.0.0.1:3000';

axios.post('api/service', {
    name: 'canabys',
    location: 'haxixe',
    isOffer: true
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });