import { useParams } from "react-router"

export default function TableEditor() {
    const { tableName } = useParams()
    return (
        <h1>
            {tableName}
        </h1>
    )
}