import React, { useState, useEffect } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ setMarkers }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchMembers = async (searchQuery) => {
    const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY);
    const index = client.initIndex('members');

    const { hits } = await index.search(searchQuery, { hitsPerPage: 100 });

    const newMarkers = hits
      .filter(hit => 'location.lat' in hit && 'location.lng' in hit && hit['location.lat'] !== "" && hit['location.lng'] !== "")
      .map(hit => ({
        lng: hit['location.lng'],
        lat: hit['location.lat'],
        fullName: hit.fullName,
        companyName: hit.companyName,
        photo: hit.photo,
        city: hit['location.city'],
        country: hit['location.country']
      }));

    setSearchResults(newMarkers);
    setMarkers(newMarkers);
    setShowDropdown(newMarkers.length > 0);
  };

  useEffect(() => {
    if (query.trim() !== '') {
      fetchMembers(query);
    } else {
      setShowDropdown(false);
    }
  }, [query, setMarkers]);

  const handleSelectMember = (member) => {
    setMarkers([member]);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
      <div style={{ position: 'relative', width: '300px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Search Members"
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: '2px solid rgba(0, 0, 255, 0.5)', // Blue border
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            width: '100%',
            paddingLeft: '40px',
            transition: 'border-color 0.3s',
            outline: 'none',
            color: '#333', // Adjusting padding to accommodate the icon
          }}
        />
        <FaSearch style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: '#aaa' }} />
        {showDropdown && (
          <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
            {searchResults.map((member, index) => (
              <div key={index} className="flex p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectMember(member)}>
                {member.photo && <img src={member.photo} alt="avatar" className="w-12 h-12 mr-2 rounded-full" />}
                <div>
                  <p className="text-lg font-semibold">{member.fullName}</p>
                  <p className="text-sm">{member.city}, {member.country}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
