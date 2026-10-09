'use client'

import { useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { syncCollection } from "../../lib/hsCollection";

export default function CollectionSync() {
    const { user, loading } = useAuth()
    const userId = user?.id ?? null

    useEffect(() => {
        if (loading) return
        syncCollection(userId).catch((error) => console.error(error))
    }, [userId, loading])

    return null
}
