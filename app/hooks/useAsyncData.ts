import { useEffect, useState } from "react";

type AsyncState<T> =
    | { key: string; status: 'success'; data: T }
    | { key: string; status: 'error' }

export function useAsyncData<T>(key: string, load: (key: string) => Promise<T>) {
    const [state, setState] = useState<AsyncState<T> | null>(null)

    useEffect(() => {
        let ignore = false
        load(key).then(
            (data) => { if (!ignore) setState({ key, status: 'success', data }) },
            (error) => {
                console.error(error)
                if (!ignore) setState({ key, status: 'error' })
            }
        )
        return () => { ignore = true }
    }, [key, load])

    return state?.key === key ? state : null
}
