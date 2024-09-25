import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function UpdateTutorial() {
  const { tutorialId, courseId, courseName } = useParams();
  const navigate = useNavigate();

  const [tutorialData, setTutorialData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Retrieve the JWT token from localStorage
        const token = localStorage.getItem('token');

        const tutorialResponse = await axios.get(`/tutorials/getT/${tutorialId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add the JWT token here
          },
        });
        const tutorial = tutorialResponse.data;
        setTutorialData({
          title: tutorial.title,
          description: tutorial.description,
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, [tutorialId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTutorialData({
      ...tutorialData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Retrieve the JWT token from localStorage
      const token = localStorage.getItem('token');

      await axios.put(`/tutorials/updateT/${tutorialId}`, tutorialData, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the JWT token here
        },
      });
      navigate(`/getTutorialAdmin/${courseId}/${courseName}`);
    } catch (error) {
      console.error('Error updating tutorial:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Optional loading state
  }

  return (
    <div>
      <h2 className="text-3xl font-semibold">Update Tutorial</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block font-semibold text-blue-900 mb-2">
            Tutorial Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={tutorialData.title}
            onChange={handleChange}
            className="border border-blue-500 rounded-lg py-2 px-3 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block font-semibold text-blue-900 mb-2">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={tutorialData.description}
            onChange={handleChange}
            className="border border-blue-500 rounded-lg py-2 px-3 w-full h-32"
          />
        </div>
        <div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
          >
            Update Tutorial
          </button>
          
          <button
            onClick={() => {
              navigate(`/getTutorialAdmin/${courseId}/${courseName}`); // Redirect to ViewTutorialAdmin
            }}
            className="bg-themeBlue text-white px-4 py-2 rounded-md hover:bg-themePurple transition duration-300 inline-block mr-2"
            type="button"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateTutorial;
