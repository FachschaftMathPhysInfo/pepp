
import { useState } from 'react';

export function useAddTutor() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [eventsAvailable, setEventsAvailable] = useState([]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const graphcmsEndpoint = 'http://localhost:8080/api';

    const mutation = `
      mutation($firstName:String!, $lastName:String!, $email:String!, $eventsAvailable:[UUID!]) {
        addTutor(tutor: {
          fn: $firstName
          sn: $lastName
          mail: $email
          eventsAvailable: $eventsAvailable
        }) 
      }
    `;

    const variables = {
      firstName,
      lastName,
      email,
      eventsAvailable,
    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any headers your API requires, such as authorization tokens
        // 'Authorization': 'Bearer YOUR_TOKEN',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    };

    try {
      const response = await fetch(graphcmsEndpoint, requestOptions);
      const data = await response.json();
      console.log('Mutation response:', data);

      // Handle success or error states based on 'data' response
    } catch (error) {
      console.error('Error performing mutation:', error);
      // Handle error states
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    eventsAvailable,
    setEventsAvailable,
    handleFormSubmit,
  };
}
