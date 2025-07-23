'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { crashOptions } from '@/core/lib/constants'
import { RepairRequest } from '@/core/lib/interfaces'
import { useParams } from 'next/navigation'

const RequestById = () => {
    const params = useParams()
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    const [application, setApplication] = useState<RepairRequest | null>(null)

    useEffect(() => {
        const getApplication = async () => {
            const res = await fetch(`/api/requestById/${id}`)
            const data = await res.json()
            setApplication(data)
        }

        if (id) getApplication()
    }, [id])

    if (!application) return <div className="text-center mt-10">Загрузка...</div>

    return (
        <div className="max-w-xl mx-auto mt-10 p-2">
            <Card className="max-w-xl mx-auto mt-10">
                <CardHeader>
                    <CardTitle>Заявка {id}</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre>{JSON.stringify(application, null, 2)}</pre>
                </CardContent>
            </Card>
        </div>
    )
}

export default RequestById
