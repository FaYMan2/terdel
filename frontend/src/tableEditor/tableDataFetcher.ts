export async function GetTableData(tableName : string) {
    try{
        const response = await fetch(`http://localhost:8080/table-data/${tableName}`)
        if(response.ok){
            const data = await response.json()
            return data.data
        }else{
            console.error(`Fetching table data failed with code ${response.status}`)
        }
    }
    catch(e){
        console.error("fetching table data failed " + e)
    }
}
