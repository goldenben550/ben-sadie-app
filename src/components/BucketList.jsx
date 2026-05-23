import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'

export default function BucketList() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch bucket list items on mount and subscribe to changes
  useEffect(() => {
    fetchItems()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('bucket_list_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bucket_list' },
        (payload) => {
          fetchItems()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bucket_list')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return

    try {
      setError('')
      const { error } = await supabase.from('bucket_list').insert({
        title: newItem,
        user_id: user.id,
        completed: false,
      })

      if (error) throw error
      setNewItem('')
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleComplete = async (id, completed) => {
    try {
      const { error } = await supabase
        .from('bucket_list')
        .update({ completed: !completed })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from('bucket_list')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Things we want to do together</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={addItem} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add a new goal..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No items yet. Add something you want to do together!
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleComplete(item.id, item.completed)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
              <span
                className={`flex-1 ${
                  item.completed
                    ? 'line-through text-gray-400'
                    : 'text-gray-800'
                }`}
              >
                {item.title}
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
        <p>
          Completed:{' '}
          <span className="font-semibold">
            {items.filter((i) => i.completed).length} / {items.length}
          </span>
        </p>
      </div>
    </div>
  )
}