import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Search, MapPin, Stethoscope, Clock } from 'lucide-react'
import api from '../api/axios.js'

export default function SearchSuggestions({ 
  searchType, 
  value, 
  onSelect, 
  placeholder,
  icon: Icon = Search,
  className = ""
}) {
  console.log(`🎯 SearchSuggestions rendered:`, { searchType, value, placeholder })
  
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [cache, setCache] = useState({})
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const timeoutRef = useRef(null)

  const fetchSuggestions = useCallback(async (query) => {
    try {
      setIsLoading(true)
      console.log(`🔍 Fetching suggestions for "${query}" (${searchType})`)
      
      // Mock data for demonstration
      let mockSuggestions = []
      
      if (searchType === 'specialty') {
        mockSuggestions = [
          'Cardiologie',
          'Dermatologie', 
          'Pédiatrie',
          'Gynécologie',
          'Neurologie',
          'Ophtalmologie',
          'Orthopédie',
          'Psychiatrie',
          'Radiologie',
          'Urologie',
          'Chirurgie générale',
          'Médecine interne',
          'Anesthésie',
          'Endocrinologie',
          'Gastro-entérologie',
          'Hématologie',
          'Néphrologie',
          'Pneumologie',
          'Rhumatologie',
          'Oncologie'
        ]
      } else if (searchType === 'location') {
        mockSuggestions = [
          'Alger',
          'Oran',
          'Constantine',
          'Annaba',
          'Blida',
          'Sétif',
          'Batna',
          'Djelfa',
          'Sidi Bel Abbès',
          'Biskra',
          'Tébessa',
          'El Oued',
          'Skikda',
          'Tiaret',
          'Béjaïa',
          'Tlemcen',
          'Ouargla',
          'Guelma',
          'Mostaganem',
          'Msila',
          'El Bayadh',
          'Bordj Bou Arréridj',
          'Boumerdès',
          'El Tarf',
          'Tindouf',
          'Tissemsilt',
          'El Oued',
          'Khenchela',
          'Souk Ahras',
          'Tipaza',
          'Mila',
          'Aïn Defla',
          'Naâma',
          'Aïn Témouchent',
          'Ghardaïa',
          'Relizane',
          'Timimoun',
          'Bordj Badji Mokhtar',
          'Ouled Djellal',
          'Béni Abbès',
          'In Salah',
          'In Guezzam',
          'Touggourt',
          'Djanet',
          'El M\'Ghair',
          'El Meniaa'
        ]
      }
      
      // Filter and sort suggestions
      const sortedSuggestions = mockSuggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => {
          const queryLower = query.toLowerCase()
          const aLower = a.toLowerCase()
          const bLower = b.toLowerCase()
          
          // Prioritize exact starts with matches
          const aStartsWith = aLower.startsWith(queryLower)
          const bStartsWith = bLower.startsWith(queryLower)
          
          if (aStartsWith && !bStartsWith) return -1
          if (!aStartsWith && bStartsWith) return 1
          
          // Then prioritize contains matches
          const aContains = aLower.includes(queryLower)
          const bContains = bLower.includes(queryLower)
          
          if (aContains && !bContains && !aStartsWith && !bStartsWith) return -1
          if (!aContains && bContains && !aStartsWith && !bStartsWith) return 1
          
          // Finally alphabetical
          return a.localeCompare(b)
        })
        .slice(0, 8) // Limit to 8 suggestions
      
      console.log(`📋 Final suggestions:`, sortedSuggestions)
      setSuggestions(sortedSuggestions)
      setShowSuggestions(true)
      console.log(`🎯 Suggestions set, showSuggestions: true`)
      
      // Cache the results
      const cacheKey = `${searchType}-${query.toLowerCase()}`
      setCache(prev => ({
        ...prev,
        [cacheKey]: sortedSuggestions
      }))
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }, [searchType])

  // Debounce search with cache
  useEffect(() => {
    console.log(`🔍 useEffect triggered with value: "${value}" (length: ${value?.length})`)
    if (!value || value.length < 1) {
      console.log(`❌ Value too short, hiding suggestions`)
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    
    console.log(`✅ Value is valid, proceeding with search`)

    // Check cache first
    const cacheKey = `${searchType}-${value.toLowerCase()}`
    if (cache[cacheKey]) {
      setSuggestions(cache[cacheKey])
      setShowSuggestions(true)
      return
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 150) // Reduced debounce time for better UX

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, searchType, fetchSuggestions])

  const handleSelect = useCallback((suggestion) => {
    onSelect(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }, [onSelect])

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleBlur = (e) => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }, 200)
  }

  return (
    <div className="relative w-full" style={{ position: 'relative' }}>
      <div className="relative" style={{ position: 'relative' }}>
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onSelect(e.target.value)}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 text-gray-900 placeholder-gray-500 font-medium text-base ${className}`}
          style={{ fontSize: '16px' }}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#007BBD]"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {console.log(`🎨 Rendering suggestions: showSuggestions=${showSuggestions}, suggestions.length=${suggestions.length}`)}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto mt-1 list-none p-0 m-0"
          style={{ zIndex: 9999 }}
        >
          {suggestions.map((suggestion, index) => {
            const isExactMatch = suggestion.toLowerCase().startsWith(value.toLowerCase())
            
            return (
              <li key={index} className="border-b border-gray-200 last:border-b-0">
                <button
                  type="button"
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 flex items-center ${
                    index === selectedIndex ? 'bg-blue-100 text-blue-700' : 'text-gray-800'
                  } ${index === 0 ? 'rounded-t-lg' : ''} ${
                    index === suggestions.length - 1 ? 'rounded-b-lg' : ''
                  }`}
                  onClick={() => handleSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={`p-1 rounded mr-3 ${
                    searchType === 'specialty' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {searchType === 'specialty' ? (
                      <Stethoscope className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isExactMatch ? 'text-blue-600' : 'text-gray-800'}`}>
                    {suggestion}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

              {/* No suggestions message */}
              {showSuggestions && suggestions.length === 0 && !isLoading && value.length >= 1 && (
        <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 mt-3 p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Aucune suggestion trouvée
            </p>
            <p className="text-gray-500">
              Essayez avec un autre terme pour "{value}"
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
