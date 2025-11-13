import pool from "../utils/db3";
import con from "../utils/db";

export const fetchPayroles = async(user, query)=>{
    const {office_id:active_office, role_name:userRole}=user;
    const{
        searchOffice=0,
        nationality=0, 
        serchpayroleStatus=1, 
        searchpayrole_rakhan_upayukat=0, 
        searchpayrole_no_id=0,
        searchmudda_id=0,
        searchbandi_name='',
        searchchecked=0,
        searchis_checked='',
        searchcourt_decision='',
        page=0,
        limit=25,
    } = query;
    const offset = page*limit;
    let baseWhere = `WHERE 1=1`;
    const params = [];

    // ✅ Role-based status filtering logic
    const roleMap = await getUserBasedStatusMap();
    let allowedStatuses = roleMap[userRole] ?? [];
    if(allowedStatuses === 'all'){
        const [allStatuses] = await pool.query('SELECT id FROM payrole_status');
        allowedStatuses = allStatuses.map((s)=>s.id);
    }

    // ✅ Apply Filters 
    if(searchedStatusKey){
        const status = Number(searchedStatusKey.id);
        if(allowedStatuses==='all' || allowedStatuses.includes(status)){
            baseWhere +=`AND p.status=?`;
            params.push(status);
        }else{
            console.log(`You are not authorized to view payroles with status ${ status }`)
        }
    }else{
        if(allowedStatuses!=='all'){
            const placeholders=allowedStatuses.map(()=>'?').join(',');
            baseWhere += `AND p.status IN (${placeholders})`;
            params.push(...allowedStatuses);
        }
    }

    if(searchmudda_id){
        const escapedGroupId = con.escape(searchmudda_id);
        baseWhere += `AND bp.id IN (
                        SELECT bmd.bandi_id 
                        FROM bandi_mudda_details bmd
                        LEFT JOIN muddas m ON bmd.mudda_id = m.id
                        WHERE m.muddas_group_id = ${escapedGroupId})`;
    }

    if(searchpayrole_no_id) {
        baseWhere +=`AND p.payrole_no_id=?`;
        params.push(searchpayrole_no_id);
    }

    if(active_office==1 || active_office==2){
        if(searchOffice && searchOffice!=='0'){
            baseWhere += `AND bp.current_office_id=?`;
            params.push(searchOffice);
        }else if(active_office!==1 && active_office!==2){
            baseWhere += `AND bp.current_office_id=?`;
            params.push(active_office);
        }
    }else{
        baseWhere += `AND bp.current_office_id=?`;
        params.push(active_office);
    }

    if(nationality !== undefined && nationality!==''){
        baseWhere +=`AND TRIM(nationality) LIKE CONCAT('%', ?, '%')`;
        params.push(nationality);
    }

    if(searchpayrole_rakhan_upayukat){
        baseWhere += `AND p.pyarole_rakhan_upayukat=?`;
        params.push(searchpayrole_rakhan_upayukat);
    }

    if(searchcourt_decision){
        baseWhere += `AND pd.payrole_result=?`;
        params.push(searchcourt_decision);
    }

    if(searchis_checked){
        baseWhere +=`AND p.is_checked=?`;
        params.push(searchis_checked);
    }

    if(searchbandi_name){
        baseWhere +=`AND bp.bandi_name LIKE ?`;
        params.push(`%${searchbandi_name}`);
    }
    try{
        //Step 1: Get matching bandi IDs

    }catch{
        
    }
}