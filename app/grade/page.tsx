"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import Sidebar from "../components/SideBar"
import { Plus, X, Pencil, Loader2, GraduationCap, Trash2, Menu } from "lucide-react"

interface Grade {
  id: string
  name: string
  order_index: number
  created_at: string
}

type ModalMode = "create" | "edit"

export default function GradePage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>("create")
  const [activeGradeId, setActiveGradeId] = useState<string | null>(null)
  const [gradeName, setGradeName] = useState("")
  const [gradeOrder, setGradeOrder] = useState<number>(1)
  
  // Custom Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchGrades = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) throw error
      setGrades((data as Grade[]) || [])
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Failed to load grades.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrades()
  }, [])

  const resetModal = () => {
    setIsModalOpen(false)
    setGradeName("")
    setGradeOrder(1)
    setActiveGradeId(null)
    setModalMode("create")
    setDeleting(false)
  }

  const openCreateModal = () => {
    const nextOrder = grades.length > 0 ? Math.max(...grades.map(g => g.order_index)) + 1 : 1
    setModalMode("create")
    setGradeOrder(nextOrder)
    setIsModalOpen(true)
  }

  const openEditModal = (grade: Grade) => {
    setModalMode("edit")
    setActiveGradeId(grade.id)
    setGradeName(grade.name)
    setGradeOrder(grade.order_index)
    setIsModalOpen(true)
  }

  const initiateDelete = () => {
    if (!activeGradeId) return
    setIdToDelete(activeGradeId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!idToDelete) return

    try {
      setDeleting(true)
      const { error } = await supabase
        .from("grades")
        .delete()
        .eq("id", idToDelete)
      
      if (error) throw error
      
      setGrades((prev) => prev.filter((g) => g.id !== idToDelete))
      setIsDeleteModalOpen(false)
      resetModal()
    } catch (err) {
      alert("Failed to delete, try again")
    } finally {
      setDeleting(false)
      setIdToDelete(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = gradeName.trim()
    if (!name || saving) return

    setSaving(true)
    try {
      if (modalMode === "create") {
        const { error } = await supabase
          .from("grades")
          .insert([{ name, order_index: gradeOrder }])
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("grades")
          .update({ name, order_index: gradeOrder })
          .eq("id", activeGradeId)
        if (error) throw error
      }
      
      await fetchGrades()
      resetModal()
    } catch (err) {
      alert("An error occurred while saving.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed top-4 left-4 z-50 p-2 bg-[#558AD1] text-white rounded-lg shadow-lg sm:hidden transition-opacity ${
          isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 sm:hidden transition-opacity ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      
      {/* Sidebar Component */}
      <aside className={`fixed top-0 left-0 z-50 w-64 h-screen transition-transform sm:sticky sm:translate-x-0 shrink-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          hideMobileButton 
        />
      </aside>

      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full overflow-x-hidden">
        {/* Header / Navbar Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pt-12 sm:pt-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Grades</h1>
            <p className="text-slate-500">View and manage school grade levels</p>
          </div>
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto bg-[#558AD1] hover:bg-[#4477b8] text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 font-semibold"
          >
            <Plus size={20} />
            <span>Add Grade</span>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-blue-600">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-slate-500 animate-pulse font-medium">Loading grades...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium">
            {error}
          </div>
        ) : grades.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center shadow-sm">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <GraduationCap className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold">No grades found</h3>
            <p className="text-slate-500 mb-6">Start by adding your first grade level.</p>
            <button onClick={openCreateModal} className="text-[#558AD1] font-bold hover:underline">
              Click here to begin
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grade Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Created</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{grade.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-[#558AD1] px-3 py-1 rounded-full text-xs font-bold">
                          {grade.created_at.slice(0, 10)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(grade)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#558AD1] hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Pencil size={16} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Main Form Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-xl text-slate-800">
                {modalMode === "create" ? "Add New Grade" : "Edit Grade Level"}
              </h3>
              <button onClick={resetModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Grade Name</label>
                <input
                  required
                  type="text"
                  value={gradeName}
                  onChange={(e) => setGradeName(e.target.value)}
                  placeholder="e.g. Primary 6"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="flex-1 px-4 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !gradeName.trim()}
                    className="flex-1 px-4 py-2.5 bg-[#558AD1] hover:bg-[#4477b8] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 size={18} className="animate-spin" />}
                    {modalMode === "create" ? "Create Grade" : "Save Changes"}
                  </button>
                </div>
                
                {modalMode === "edit" && (
                  <button
                    type="button"
                    onClick={initiateDelete}
                    className="w-full px-4 py-2.5 text-red-500 text-sm bg-red-50 font-bold hover:bg-red-100 rounded-xl mt-4 transition-colors flex items-center justify-center gap-2 border border-red-100"
                  >
                    <Trash2 size={16} />
                    Delete {gradeName}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-700">{gradeName}</span>? 
              This action is permanent and may affect linked student records.
            </p>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={18} className="animate-spin" /> : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}