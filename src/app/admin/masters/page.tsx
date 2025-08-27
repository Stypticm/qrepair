'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
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
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <section className='flex flex-col gap-4'>
                <h1 className="text-3xl font-bold text-white text-center">Управление мастерами</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                      + Добавить мастера
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Добавить нового мастера</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="telegramId" className="text-gray-300">Telegram ID *</Label>
                        <Input
                          id="telegramId"
                          value={newMaster.telegramId}
                          onChange={(e) => setNewMaster({ ...newMaster, telegramId: e.target.value })}
                          placeholder="123456789"
                          className="text-white bg-gray-700 border-gray-600 placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username" className="text-gray-300">Username *</Label>
                        <Input
                          id="username"
                          value={newMaster.username}
                          onChange={(e) => setNewMaster({ ...newMaster, username: e.target.value })}
                          placeholder="username (без @)"
                          className="text-white bg-gray-700 border-gray-600 placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name" className="text-gray-300">Имя</Label>
                        <Input
                          id="name"
                          value={newMaster.name}
                          onChange={(e) => setNewMaster({ ...newMaster, name: e.target.value })}
                          placeholder="Полное имя мастера"
                          className="text-white bg-gray-700 border-gray-600 placeholder-gray-400"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                          className="text-gray-300 border-gray-600 hover:bg-gray-700"
                        >
                          Отмена
                        </Button>
                        <Button onClick={addMaster} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                <div className="text-white">Загрузка мастеров...</div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {masters.map((master) => (
                  <Card key={master.id} className="bg-gray-800 border-gray-700 shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-white text-lg">{master.name || master.username}</CardTitle>
                        <Badge
                          variant={master.isActive ? "default" : "secondary"}
                          className={master.isActive ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"}
                        >
                          {master.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-400">Username:</Label>
                        <div className="text-white font-mono">@{master.username}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-400">Telegram ID:</Label>
                        <div className="text-white font-mono">{master.telegramId}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-400">Добавлен:</Label>
                        <div className="text-white">
                          {new Date(master.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2 justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleMasterStatus(master.id, master.isActive)}
                          className="text-gray-700 !font-bold border-gray-600 hover:bg-gray-700"
                        >
                          {master.isActive ? 'Деактивировать' : 'Активировать'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMaster(master.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
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
                <div className="text-white text-lg">Мастера не найдены</div>
                <div className="text-gray-400 mt-2">Добавьте первого мастера, чтобы начать работу</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  )
}
