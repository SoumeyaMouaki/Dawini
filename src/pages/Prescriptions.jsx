import { useQuery } from '@tanstack/react-query'
import api from '../api/axios.js'
import Card from '../components/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Prescriptions() {
  const { user } = useAuth()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['prescriptions', user?.id],
    queryFn: async () => {
      // Expected backend: GET /api/patients/:id/prescriptions
      const { data } = await api.get(`/api/patients/${user.id}/prescriptions`)
      return data
    },
    enabled: !!user
  })

  if (!user) return <p>Please log in to view your prescriptions.</p>
  if (isLoading) return <p>Loading prescriptions...</p>
  if (isError) return <p>Could not load prescriptions.</p>

  return (
    <Card title="My Prescriptions">
      <ul className="space-y-3">
        {(data || []).map(p => (
          <li key={p.id} className="p-3 rounded border border-gray-200 flex justify-between">
            <div>
              <p className="font-medium">{p.medicineName}</p>
              <p className="text-sm text-gray-600">Prescribed by Dr. {p.doctorName} • {new Date(p.date).toLocaleDateString()}</p>
            </div>
            <span className="text-sm px-2 py-1 rounded bg-surface">{p.status}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
