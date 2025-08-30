'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Page } from '@/components/Page'

interface Master {
  id: string
  telegramId: string
  username: string
  name: string
  isActive: boolean
  createdAt: string
}

export default function MastersPage() {
  const router = useRouter()
  const [masters, setMasters] = useState<Master[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newMaster, setNewMaster] = useState({
    telegramId: '',
    username: '',
    name: ''
  })

  // Загрузка мастеров
  const loadMasters = async () => {
    try {
      const response = await fetch('/api/admin/masters')
      if (response.ok) {
        const data = await response.json()
        setMasters(data.masters)
      }
    } catch (error) {
      console.error('Error loading masters:', error)
      toast.error('Ошибка загрузки мастеров')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMasters()
  }, [])

  // Добавление мастера
  const addMaster = async () => {
    if (!newMaster.telegramId || !newMaster.username) {
      toast.error('Заполните все обязательные поля')
      return
    }

    try {
      const response = await fetch('/api/admin/add-master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMaster),
      })

      if (response.ok) {
        toast.success('Мастер добавлен')
        setNewMaster({ telegramId: '', username: '', name: '' })
        setIsAddDialogOpen(false)
        loadMasters()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка добавления мастера')
      }
    } catch (error) {
      console.error('Error adding master:', error)
      toast.error('Ошибка добавления мастера')
    }
  }

  // Удаление мастера
  const deleteMaster = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого мастера?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/masters/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Мастер удалён')
        loadMasters()
      } else {
        toast.error('Ошибка удаления мастера')
      }
    } catch (error) {
      console.error('Error deleting master:', error)
      toast.error('Ошибка удаления мастера')
    }
  }

  // Активация/деактивация мастера
  const toggleMasterStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/masters/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        toast.success(`Мастер ${!currentStatus ? 'активирован' : 'деактивирован'}`)
        loadMasters()
      } else {
        toast.error('Ошибка изменения статуса')
      }
    } catch (error) {
      console.error('Error toggling master status:', error)
      toast.error('Ошибка изменения статуса')
    }
  }

  return (
    <Page back={true}>
      <div className="min-h-dvh w-full flex flex-col bg-gradient-to-b from-white to-gray-50">
        <div className="flex-1 w-full p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <section className='flex flex-col gap-4'>
                <h1 className="text-3xl font-semibold text-gray-900 text-center mb-2">👨‍🔧 Управление мастерами</h1>
                <p className="text-gray-600 text-center">Добавление и управление мастерами системы</p>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#2dc2c6] hover:bg-[#25a8ac] text-white shadow-lg rounded-xl transition-all duration-200 hover:shadow-xl">
                      + Добавить мастера
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Добавить нового мастера</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="telegramId" className="text-gray-700">Telegram ID *</Label>
                        <Input
                          id="telegramId"
                          value={newMaster.telegramId}
                          onChange={(e) => setNewMaster({ ...newMaster, telegramId: e.target.value })}
                          placeholder="123456789"
                          className="text-gray-900 bg-white border border-gray-200 placeholder-gray-400 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username" className="text-gray-700">Username *</Label>
                        <Input
                          id="username"
                          value={newMaster.username}
                          onChange={(e) => setNewMaster({ ...newMaster, username: e.target.value })}
                          placeholder="username (без @)"
                          className="text-gray-900 bg-white border border-gray-200 placeholder-gray-400 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name" className="text-gray-700">Имя</Label>
                        <Input
                          id="name"
                          value={newMaster.name}
                          onChange={(e) => setNewMaster({ ...newMaster, name: e.target.value })}
                          placeholder="Полное имя мастера"
                          className="text-gray-900 bg-white border border-gray-200 placeholder-gray-400 rounded-lg"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                          className="text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg"
                        >
                          Отмена
                        </Button>
                        <Button onClick={addMaster} className="bg-[#2dc2c6] hover:bg-[#25a8ac] text-white rounded-lg">
                          Добавить
                        </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </section>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">Загрузка мастеров...</div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {masters.map((master) => (
                    <Card key={master.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-gray-900 text-lg">{master.name || master.username}</CardTitle>
                          <Badge
                            variant={master.isActive ? "default" : "secondary"}
                            className={master.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                          >
                            {master.isActive ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Username:</Label>
                          <div className="text-gray-900 font-mono">@{master.username}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Telegram ID:</Label>
                          <div className="text-gray-900 font-mono">{master.telegramId}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Добавлен:</Label>
                          <div className="text-gray-900">
                            {new Date(master.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-2 justify-between">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleMasterStatus(master.id, master.isActive)}
                            className="text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg"
                          >
                            {master.isActive ? 'Деактивировать' : 'Активировать'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMaster(master.id)}>
                            Удалить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && masters.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-900 text-lg">Мастера не найдены</div>
                  <div className="text-gray-600 mt-2">Добавьте первого мастера, чтобы начать работу</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Page>
  )
}
