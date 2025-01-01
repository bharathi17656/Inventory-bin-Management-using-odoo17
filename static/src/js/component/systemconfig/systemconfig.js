
/* @odoo-module */
import { Component, useState, useEffect, useRef,onWillStart,onMounted } from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";


export class SystemSettings extends Component {

    setup(){
        this.state=useState({
            popupmode:false,
            updatevendor_id:null,
            updatecustomer_id:null,
            updateuser_id:null,

            warning:false,
            popupmodewarning:false,


            table:0,
            tabledata:[],
            filteredTableData:[],

            globaldata:[],

            updatepage:'user',
            userlist:[],
            usertable:[],
            itsemployee:null,
            usergrouplist:[],
            paragrouplist:null,


            currentPage: 1, // The current page being viewed
			pageSize: 10, // Number of rows per page
			totalPages: 0, // Total number of pages


            userdata:{
            name:null,
            email:null,
            type: null,
            password:null,
            confirmpassword:null
            },
            vendordata:{
               name:null,
               mobile:null,
               email:null,
               address:null,
               cname:null,
               city:'Coimbatore',
               state:'Tamil Nadu',
               pincode:null

            },
            customerdata:{
                name:null,
                mobile:null,
                email:null,
                address:null,
                city:'Coimbatore',
                state:'Tamil Nadu',
                pincode:null
    
 
             },
             resetpassword:{
                userid:null,
                password:null,
                confirmpass:null,
                
 
 
             },

             user_error:{
                error_name:null,
                error_user_name:null,
                error_pass:null,
                error_confirm_pass:null
             },
             vendor_error:{
                error_name:null,
                error_number:null,
                error_cname:null,
                error_address:null
             },
             customer_error:{
                name:null,
                number:null
             },
         
             
           

            


        })

       

        onWillStart(async()=>{

            
        
            this.getuserlist();
            // this.getaccessgroups();
            this.getusergroup();
          

         


          
        })




        
    }




    


    globalsearch = (e) => {
        const searchInput = e.target.value.toLowerCase(); // Get user input and convert to lowercase
        const filteredData = this.state.userlist.filter(user => {
            // Check if 'name' or 'email' includes the search input
            return (
                (user.name && user.name.toLowerCase().includes(searchInput)) ||
                (user.email && user.email.toLowerCase().includes(searchInput))
            );
        });
        
       this.state.globaldata=filteredData
       if(this.state.globaldata.length >0){
        this.state.currentPage=1
    

       }
       else{
        this.state.currentPage=0   

       }
      

       

       this.updatePagination()
    };

    async  createOrUpdateEmployee(userId,name) {
        try {
            // Check if the user already has an associated employee
            const employeeIds = await jsonrpc('/web/dataset/call_kw', {
                model: 'hr.employee',
                method: 'search',
                args: [[['user_id', '=', userId]]], // Search for employee by user_id
                kwargs: {},
            });
    
            if (employeeIds.length > 0) {
                // User already has an employee, update it
                const employeeId = employeeIds[0]; // Get the first employee ID
                await this.updateEmployee(employeeId, userId);
            } else {
                // User doesn't have an employee, create one
                await this.createEmployee(userId,name);
            }
        } catch (error) {
            console.error("Error checking or processing employee:", error);
        }
    }
    
    // Function to create a new employee
    async  createEmployee(userId,name) {
        try {
            const employee = await jsonrpc('/web/dataset/call_kw', {
                model: 'hr.employee',
                method: 'create',
                args: [{
                    user_id: userId,
                    name: name,  // You can replace this with a dynamic name
                    job_title: "Employee", // Optional: Set job title or other fields
                    // Add any other fields as needed
                }],
                kwargs: {},
            });
            console.log("Employee created with ID:", employee);
        } catch (error) {
            console.error("Error creating employee:", error);
        }
    }
    
    // Function to update an existing employee
    async  updateEmployee(employeeId, userId) {
        try {
            await jsonrpc('/web/dataset/call_kw', {
                model: 'hr.employee',
                method: 'write',
                args: [[employeeId], {
                    user_id: userId,
                    // Add fields to update as needed, e.g., name, job_title, etc.
                }],
                kwargs: {},
            });
            console.log("Employee updated successfully.");
        } catch (error) {
            console.error("Error updating employee:", error);
        }
    }



    warningalert=()=>{
        this.state.warning=true
        // this.state.popupmodewarning=true
        console.log("thid warning messsage runs here")

        setTimeout(()=>{
            this.dynamicsetclass();
        },0)
        
    }

    dynamicsetclass=()=>{
        if (this.state.updatepage === 'customer' || this.state.updatepage === 'vendor') {
            let data = document.getElementById('warning_popup');
            console.log("this is my popup dynamivc class uppdate ",data)
            if (data) {
                data.classList.add('adjusted-bottom');
            }
        } else {
            let data = document.getElementById('warning_popup');
            if (data) {
                data.classList.remove('adjusted-bottom');
            }
        }
    }



    clearrecordform=()=>{
      if(this.state.updatepage == 'user'){
        this.clearolduser()

      } 
      if(this.state.updatepage == 'customer'){
        this.clearupdatecustomer()

      } 
      if(this.state.updatepage == 'vendor'){
        this.clearupdatevendor()

      }  

      this.state.warning=false
    }
 





    updateusermodel =async(id)=>{
        console.log("---------------------------this is user id for u[date vendor",id)
        this.state.updateuser_id=id
        this.state.popupmode=true;

        try{
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'our.customer',
                method: 'getupdateuser',
                args: [[],id],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {},

            });
            console.log("this is my updated user data" ,result)

            


            result.map(user=>{
          
                    const form = document.getElementById('dropdownForm3'); // Get the form by ID
                    if (form) {
                        // Populate form fields with vendor data
                        
                        form.querySelector('.material-textfield-user input[name="name"]').value = user.name || '';
                        this.state.userdata.name=user.name || '';
                        form.querySelector('.material-textfield-user input[name="email"]').value = user.login || '';
                        this.state.userdata.email=user.login || '';
        
                    }


           
                    
                
            })
           
            console.log("this is vendor data from updated state", this.state)

        
            

        }
        catch{
          console.log("the error is comming from while fetching the data")
        }

         
}



    updateolduser=async()=>{
        const id = this.state.updateuser_id

        const vals_list={name:this.state.userdata.name,
                        email:this.state.userdata.email 
                         }

        try{
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'res.partner',
                method: 'update_user',
                args: [[],id,vals_list],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {},
            });
    
            console.log("this is the result pof user",result)
            this.env.services.notification.add(`${this.state.userdata.name} Details Updated Successfully `, { type: "success" });
            this.exitpopup()
            this.getuserlist();
                    
    
        }
        catch{
            console.log("i got errof from submit user")
            this.env.services.notification.add("i am get error while update the user details ", { type: "danger" });
           
        }



    }

    



    getusergroup =()=>{


        jsonrpc("/web/dataset/call_kw", {
            model: "res.groups",
            method: "search_read",
            args: [[], ["id", "name", "category_id"]], // Empty domain [] to fetch all groups
            kwargs: {
                limit: 1000,  order: "id asc"
            },
        }).then(groups => {

            this.state.usergrouplist=groups
            console.log("Access Groups List:", groups);
            groups.forEach(group => {
                const categoryName = group.category_id ? group.category_id[1] : 'No category'; // Fetch the category name from category_id
                console.log(`ID: ${group.id}, Name: ${group.name}, Category: ${categoryName}`);
            });
        }).catch(error => {
            console.error("Error fetching groups:", error);
        }).then(()=>{
            this.getusercreationgroup()
        })







        let checkgroups=['inventory_management_master.inventory_access_management_employee']
  
            Promise.all(checkgroups.map((e)=>{
                return jsonrpc('/web/dataset/call_kw', {
                    model: 'res.users',
                    method: 'has_group',
                    args: [e], // Replace with your group technical name
                    kwargs: {},
                });

            })).then(e=>{
                this.state.itsemployee=e[0]
            })



            

        }


        getusercreationgroup(){
            let grouplist=[]

            this.state.usergrouplist.map((data)=>{
                if(data.name === 'Internal User' ){
                    if(data.category_id[1] === 'User types'){
                        grouplist.push(data.id)
                    }
                }
                else if(data.name == 'Administrator' ){
                    if(data.category_id[1] == 'Employees'){
                        grouplist.push(data.id)
                    }
                }
                if(data.name =='Administrator' ){
                    if(data.category_id[1] == 'Inventory'){
                        grouplist.push(data.id)
                    }
                }
                if(data.name === 'Settings' ){
                    if(data.category_id[1] === 'Administration'){
                        grouplist.push(data.id)
                    }
                }
                if(data.name === 'Administrator' ){
                    if(data.category_id[1] === 'Purchase'){
                        grouplist.push(data.id)
                    }
                }
                if(data.name === 'Officer: Manage all employees' ){
                    if(data.category_id[1] === 'Employees'){
                        grouplist.push(data.id)
                    }
                }

                
                
        
            })


            console.log("this is my  to send the group", grouplist)


            this.state.paragrouplist=grouplist
        }


    updatePagination = () => {
		const startIndex = (this.state.currentPage - 1) * this.state.pageSize;
		const endIndex = startIndex + this.state.pageSize;
		this.state.filteredTableData = this.state.globaldata.slice(startIndex, endIndex);


        console.log("this is my pagination filteredTableData",this.state.filteredTableData)
		this.state.totalPages = Math.ceil(this.state.globaldata.length / this.state.pageSize);
	};
	
	changePage = (newPage) => {
		if (newPage > 0 && newPage <= this.state.totalPages) {
			this.state.currentPage = newPage;
			this.updatePagination();
		}
	};

    
   updateuser =()=>{
    this.state.updatepage = 'user'
    this.getuserlist();

   }

   updatevendor =()=>{
    this.state.updatepage = 'vendor'
    this.getvendorlist();

   }
   updatecustomer =()=>{
    this.state.updatepage = 'customer'
    this.getcustomerlist();

   }

  updateresetpassword = (id) => {

    
    this.state.resetpassword.userid=id
    this.state.updatepage = 'resetpassword';


    try {
        setTimeout(()=>{
            const form = document.getElementById('dropdownForm6'); // Get the form by ID
        if (!form) {
            console.error("Form not found with ID 'dropdownForm6'");
            return;
        }

    
        // Get the select element
        const selectuser = form.querySelector('select[name="selectuser"]');
        if (!selectuser) {
            console.error("Select element with name 'selectuser' not found in the form.");
            return;
        }

        // Find and select the matching option
        const options = selectuser.options;
        let optionFound = false;

        for (let i = 0; i < options.length; i++) {
            if (parseInt(options[i].value, 10) === id) {
                options[i].selected = true; // Mark the matching option as selected
                optionFound = true;
                console.log("Matching option selected:", options[i]);
                break;
            }
        }

        if (!optionFound) {
            console.warn(`No matching option found for ID: ${id}`);
        }

        },0)
        
    } catch (error) {
        console.error("Error in updateresetpassword:", error);
    }
};




   onchangeuserdata=(e)=>{
    if(e && e.target){
        const name=e.target.name
        const value=e.target.value
        if (name=='name'){
            this.state.userdata.name=value
          
        }
        else if(name=='email'){
            this.state.userdata.email=value

        }
        else if(name=='mobile'){
            this.state.userdata.mobile=value

        }
        else if(name=='address'){
            this.state.userdata.address=value

        }
        else if(name=='password'){
            this.state.userdata.password=value

        }
        else if(name=='confirmpassword'){
            this.state.userdata.confirmpassword=value

        }
        if (name === "admin") {
            const checked = e.target.checked
            this.state.userdata.type = checked ? "admin" : null;
        } else if (name === "emp") {
            const checked = e.target.checked
            this.state.userdata.type = checked ? "emp" : null;
        }

        console.log("Updated state:", this.state);
    }
   }

//    getaccessgroups = async()=>{
//     try{
//         const result = await jsonrpc('/web/dataset/call_kw', {
//             model: 'stock.move',
//             method: 'get_inventory_category',
//             args: [],  // Add an empty array as `args` to avoid the IndexError
//             kwargs: {},
//         });
    
    
//         console.log("---------------------------------------------this is given access groups",result)

//     }
//     catch{
//         console.log("---------------------------------------------error in get access")
//     }
    
//    }


   submituser = async()=>{

    this.state.usergrouplist.map((data)=>{
    if(this.state.userdata.type == 'admin'){
        if(data.name === 'Admin' ){
            if(data.category_id[1] === 'Inventory Management Rights'){
                this.state.paragrouplist.push(data.id)
            }
        }

    }
    if(this.state.userdata.type == 'emp'){
    if(data.name === 'Employee' ){
        if(data.category_id[1] === 'Inventory Management Rights'){
            this.state.paragrouplist.push(data.id)
        }
    }
}
    })
        
    console.log("this is my user updated data from emplooyee group list", this.state.paragrouplist)

    if(this.state.userdata.name != null && this.state.userdata.email != null && this.state.userdata.password != null){
        console.log("this is my suvbmit user ",this.state.userdata)

        if (this.state.userdata.password == this.state.userdata.confirmpassword){

            console.log("this is my slected user ",this.state.userdata)
       

            try{

                

        


                const vals_list = [{
                    'employee_ids': [],
                    
                    'image_1920': false,
                    'name': this.state.userdata.name,
                    'email': this.state.userdata.email,
                    'login': this.state.userdata.email,
                    'company_ids': [[4, 1]],
                    'company_id': 1,
                    'active': true,
                    'lang': 'en_US',
                    'tz': 'Asia/Calcutta',
                    'action_id': false,
                    'notification_type': 'email',
                    'odoobot_state': false,
                    'signature': '<p data-o-mail-quote="1">--<br data-o-mail-quote="1">name</p>',
                    'groups_id':this.state.paragrouplist
                }];
                

                console.log("this is my user created para vals",vals_list)
        
                     
        
                const result = await jsonrpc('/web/dataset/call_kw', {
                    model: 'res.users',
                    method: 'create',
                    args: [vals_list],  // Add an empty array as `args` to avoid the IndexError
                    kwargs: {},
                });
        
                

                
                
               

                this.createOrUpdateEmployee(result[0],this.state.userdata.name)
                this.updatepass(result,this.state.userdata.password,this.state.userdata.confirmpassword)
                this.clearuser()
                this.getuserlist();
               

                console.log('this is created new user ', result)


                this.env.services.notification.add("This User Created Successfully ", { type: "success" });


             

                
     
        
             }
             catch {
                this.env.services.notification.add("This User Name Already Available ", { type: "danger" });
        
             }

        }
        else{

            this.state.user_error.error_confirm_pass = 'Password and Confirm Password is Mismatch'

           
            this.reseterror();
     
         
        }
         
    }
    else{
        if(this.state.userdata.name == null && this.state.userdata.email != null && this.state.userdata.password != null){
            this.state.user_error.error_name = 'Please Enter Your Name'
            this.reseterror();
        }else if(this.state.userdata.name != null && this.state.userdata.email == null && this.state.userdata.password != null){
             this.state.user_error.error_user_name = 'Please Enter Valid User-Name'
             this.reseterror();
        }
        else if(this.state.userdata.name != null && this.state.userdata.email != null && this.state.userdata.password == null){
            this.state.user_error.error_pass = 'Please Enter Password'
            this.reseterror();
       }
       else if(this.state.userdata.name == null && this.state.userdata.email == null && this.state.userdata.password != null){
         this.state.user_error.error_name = 'Please Enter Your Name'
         this.state.user_error.error_user_name = 'Please Enter Valid User-Name'
         this.reseterror();
   }
    else if(this.state.userdata.name != null && this.state.userdata.email == null && this.state.userdata.password == null){
        this.state.user_error.error_pass = 'Please Enter Password'
        this.state.user_error.error_user_name = 'Please Enter Valid User-Name'
        this.reseterror();
    }   

    else if(this.state.userdata.name == null && this.state.userdata.email != null && this.state.userdata.password == null){
        this.state.user_error.error_pass = 'Please Enter Password'
      this.state.user_error.error_name = 'Please Enter Your Name'
      this.reseterror();
    }

    else {
        this.state.user_error.error_pass = 'Please Enter Password'
        this.state.user_error.error_user_name = 'Please Enter Valid User-Name'
        
    
      this.state.user_error.error_name = 'Please Enter Your Name'
      this.reseterror();
    }
       
    }



    
   }

   updatepass =(a,b,c)=>{

    this.state.resetpassword.userid = a[0]
    this.state.resetpassword.password=b
    this.state.resetpassword.confirmpass= c
   

    this.resetpassword()

   }


   clearuser =()=>{
    const form = document.getElementById('dropdownForm');

        // Reset the values of all input fields within the form
        if (form) {
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = ''; // Clear the value of each input
            });
        }
   }



   clearupdatevendor =()=>{
    const form = document.getElementById('dropdownForm1');

        // Reset the values of all input fields within the form
        if (form) {
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = ''; // Clear the value of each input
            });
        }
   }


   clearupdatecustomer =()=>{
    const form = document.getElementById('dropdownForm2');

        // Reset the values of all input fields within the form
        if (form) {
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = ''; // Clear the value of each input
            });
        }
   }


   clearolduser =()=>{
    const form = document.getElementById('dropdownForm3');

        // Reset the values of all input fields within the form
        if (form) {
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = ''; // Clear the value of each input
            });
        }
   }

//    vendor



onchangevendordata=(e)=>{
    if(e && e.target){
        const name=e.target.name
        const value=e.target.value
        if (name=='name'){
            this.state.vendordata.name=value
          
        }
        else if(name=='email'){
            this.state.vendordata.email=value

        }
        else if(name=='mobile'){
            this.state.vendordata.mobile=value

        }
        else if (name == 'cname'){
            this.state.vendordata.cname=value
        }
        else if(name=='address'){
            this.state.vendordata.address=value

        }
        else if (name == 'city'){
            this.state.vendordata.city=value

        }
        else if(name=='state'){
            this.state.vendordata.state=value

        }
        else if (name == 'pincode'){
            this.state.vendordata.pincode=value
        }
       
        console.log("this is my state " ,this.state)
    }
   }



   submitvendor =async()=>{

    const vals_list={
        name:this.state.vendordata.name,
        email:'vendor@gmail.com',
        number:this.state.vendordata.mobile,
        address:this.state.vendordata.address,
        cname:this.state.vendordata.cname,
        city:this.state.vendordata.city,
        state:this.state.vendordata.state,
        pincode:this.state.vendordata.pincode


    }

    if(vals_list['name'] != null && vals_list['number'] != null && vals_list['address'] && vals_list['cname'] != null){


        try{
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'our.vendor',
                method: 'create_vendor',
                args: [[],vals_list],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {},
            });
    
            console.log("this is the result pof vendor",result)
            this.env.services.notification.add("This Vendor Created Successfully ", { type: "success" });
            this.clearuser()
            this.getvendorlist();
                

        }
        catch{
            this.env.services.notification.add("This mobile number already  registered ", { type: "danger" });
       

    }

   }

   else {
    if (!vals_list['name'] && vals_list['number'] && vals_list['address'] && vals_list['cname']) {
        this.state.vendor_error.error_name = 'Please Enter Vendor Name';
        this.reseterrorvendor();
    } 
    else if (vals_list['name'] && !vals_list['number'] && vals_list['address'] && vals_list['cname']) {
        this.state.vendor_error.error_number = 'Please Enter a Valid Mobile Number';
        this.reseterrorvendor();
    } 
    else if (vals_list['name'] && vals_list['number'] && !vals_list['address'] && vals_list['cname']) {
        this.state.vendor_error.error_address = 'Please Enter Vendor Address';
        this.reseterrorvendor();
    } 
    else if (vals_list['name'] && vals_list['number'] && vals_list['address'] && !vals_list['cname']) {
        this.state.vendor_error.error_cname = 'Please Enter Contact Person Name';
        this.reseterrorvendor();
    } 
    else if (!vals_list['name'] && !vals_list['number'] && vals_list['address'] && vals_list['cname']) {
        this.state.vendor_error.error_name = 'Please Enter Vendor Name';
        this.state.vendor_error.error_number = 'Please Enter a Valid Mobile Number';
        this.reseterrorvendor();
    } 
    else if (!vals_list['name'] && vals_list['number'] && !vals_list['address'] && vals_list['cname']) {
        this.state.vendor_error.error_name = 'Please Enter Vendor Name';
        this.state.vendor_error.error_address = 'Please Enter Vendor Address';
        this.reseterrorvendor();
    } 
    else if (!vals_list['name'] && vals_list['number'] && vals_list['address'] && !vals_list['cname']) {
        this.state.vendor_error.error_name = 'Please Enter Vendor Name';
        this.state.vendor_error.error_cname = 'Please Enter Contact Person Name';
        this.reseterrorvendor();
    } 
    else if (vals_list['name'] && !vals_list['number'] && !vals_list['address'] && vals_list['cname']) {
        this.state.vendor_error.error_number = 'Please Enter a Valid Mobile Number';
        this.state.vendor_error.error_address = 'Please Enter Vendor Address';
        this.reseterrorvendor();
    } 
    else if (vals_list['name'] && vals_list['number'] && !vals_list['address'] && !vals_list['cname']) {
        this.state.vendor_error.error_address = 'Please Enter Vendor Address';
        this.state.vendor_error.error_cname = 'Please Enter Contact Person Name';
        this.reseterrorvendor();
    } 
    else if (!vals_list['name'] && !vals_list['number'] && !vals_list['address'] && vals_list['cname']) {
        this.state.vendor_error.error_name = 'Please Enter Vendor Name';
        this.state.vendor_error.error_number = 'Please Enter a Valid Mobile Number';
        this.state.vendor_error.error_address = 'Please Enter Vendor Address';
        this.reseterrorvendor();
    } 
    else if (vals_list['name'] && !vals_list['number'] && !vals_list['address'] && !vals_list['cname']) {
        this.state.vendor_error.error_number = 'Please Enter a Valid Mobile Number';
        this.state.vendor_error.error_address = 'Please Enter Vendor Address';
        this.state.vendor_error.error_cname = 'Please Enter Contact Person Name';
        this.reseterrorvendor();
    } 
    else if (!vals_list['name'] && !vals_list['number'] && !vals_list['address'] && !vals_list['cname']) {
        this.state.vendor_error.error_name = 'Please Enter Vendor Name';
        this.state.vendor_error.error_number = 'Please Enter a Valid Mobile Number';
        this.state.vendor_error.error_address = 'Please Enter Vendor Address';
        this.state.vendor_error.error_cname = 'Please Enter Contact Person Name';
        this.reseterrorvendor();
    } 
    else {
        this.state.vendor_error.error_name = 'Please Enter Vendor Name';
        this.state.vendor_error.error_number = 'Please Enter a Valid Mobile Number';
        this.state.vendor_error.error_address = 'Please Enter Vendor Address';
        this.state.vendor_error.error_cname = 'Please Enter Contact Person Name';
        this.reseterrorvendor();
    }
}

}


reseterror=()=>{

    

    setTimeout(() => {

    const e=this.state.user_error

        if(e['error_name'] != null){
            e['error_name'] = null
        }
         if(e['error_user_name'] != null){
            e['error_user_name'] = null
        }
         if(e['error_pass'] != null){
            e['error_pass']= null
        }
        else{
            e['error_confirm_pass'] =null

        } },5000)
}



reseterrorvendor=()=>{

    

    // setTimeout(() => {

    // const e=this.state.vendor_error

    //     if(e['error_name'] != null){
    //         e['error_name'] = null
    //     }
    //      if(e['error_number'] != null){
    //         e['error_number'] = null
    //     }
    //      if(e['error_cname'] != null){
    //         e['error_cname']= null
    //     }
    //     else{
    //         e['error_address'] =null

    //     } },5000)
}


    exitpopup=()=>{
        this.state.popupmode=false
    }

    updatevendormodel = async (id) => {
        console.log("---------------------------this is user id for update vendor", id);
        this.state.updatevendor_id = id;
        this.state.popupmode = true;
    
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'our.vendor',
                method: 'get_vendor_data',
                args: [[], id],  // Ensure correct arguments are passed
                kwargs: {},
            });
    
            console.log("this is my updated vendor data", result);
    
            // Check if result is an array or a single object
            const vendors = Array.isArray(result) ? result : [result];
    
            vendors.forEach((vendor) => {
                const form = document.getElementById('dropdownForm1');
                if (form) {
                    // Set values using unique IDs
                    document.getElementById('vendorName').value = vendor.name || '';
                    this.state.vendordata.name = vendor.name || '';
            
                    document.getElementById('vendorMobile').value = vendor.number || '';
                    this.state.vendordata.mobile = vendor.number || '';
            
                    document.getElementById('vendorCName').value = vendor.cname || '';
                    this.state.vendordata.cname = vendor.cname || '';
            
                    document.getElementById('vendorAddress').value = vendor.address || '';
                    this.state.vendordata.address = vendor.address || '';
            
                    document.getElementById('vendorCity').value = vendor.city || '';
                    this.state.vendordata.city = vendor.city || '';
            
                    document.getElementById('vendorState').value = vendor.state || '';
                    this.state.vendordata.state = vendor.state || '';
            
                    document.getElementById('vendorPincode').value = vendor.pincode || '';
                    this.state.vendordata.pincode = vendor.pincode || '';
                } else {
                    console.error("Form with ID 'dropdownForm1' not found in the DOM.");
                }
            });
            
        } catch (error) {
            console.log("An error occurred while fetching the data:", error);
        }
    };
    



    updateoldvendor=async()=>{
        const id = this.state.updatevendor_id

        console.log("this is the my progras data ", this.state)

        const vals_list={name:this.state.vendordata.name,
            number:this.state.vendordata.mobile,
            email:this.state.vendordata.email,
            address:this.state.vendordata.address,
            cname:this.state.vendordata.cname,
            city:this.state.vendordata.city,
            state:this.state.vendordata.state,
            pincode:this.state.vendordata.pincode
        }

        try{
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'our.vendor',
                method: 'update_vendor',
                args: [[],id,vals_list],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {},
            });
    
            console.log("this is the result pof vendor",result)
            this.env.services.notification.add(`${this.state.vendordata.name} Details Updated Successfully `, { type: "success" });
            this.exitpopup()
            this.getvendorlist();
                    
    
        }
        catch{
            console.log("i got errof from submit vendor")
            this.env.services.notification.add("i am get error while update the vendor details ", { type: "danger" });
           
        }



    }


//    customer



onchangecustomerdata=(e)=>{
    if(e && e.target){
        const name=e.target.name
        const value=e.target.value

        console.log("this is the my customer onclick for update",e.target.value)
        if (name=='name'){
            this.state.customerdata.name=value
          
        }
        else if(name=='email'){
            this.state.customerdata.email=value

        }
        else if(name=='mobile'){
            this.state.customerdata.mobile=value

        }
        else if(name=='address'){
            this.state.customerdata.address=value
        }
        else if (name == 'city'){
            this.state.customerdata.city=value
        }
        else if(name =='state'){
            this.state.customerdata.state=value

        }
        else if (name == 'pincode'){
            this.state.customerdata.pincode=value
        }
        
        console.log("this is my state after event now changed " ,name,value,this.state)
    }
   }



   submitcustomer =async()=>{
    const vals_list={
        name:this.state.customerdata.name,
        email:'customer@gmail.com',
        number:this.state.customerdata.mobile,
        address:this.state.customerdata.address,
        city:this.state.customerdata.city,
        state:this.state.customerdata.state,
        pincode:this.state.customerdata.pincode


    }

    if (!vals_list['name'] || !vals_list['number']) {
        // Show error notification
        this.env.services.notification.add("Name And Mobile Number Field Required ", { type: "danger" });
       
    }
    else{

    try{
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'our.customer',
            method: 'create_customer',
            args: [[],vals_list],  // Add an empty array as `args` to avoid the IndexError
            kwargs: {},
        });

        console.log("this is the result pof vendor",result)
        this.env.services.notification.add("This Customer Created Successfully ", { type: "success" });
        this.clearuser()
        this.getcustomerlist();
                

    }
    catch{
        console.log("i got errof from submit vendor")
        this.env.services.notification.add("This mobile number already  registered ", { type: "danger" });
       
    }
}


   }



   
   updatecustomermodel =async(id)=>{
    console.log("---------------------------this is user id for u[date vendor",id)
    this.state.updatecustomer_id=id
    this.state.popupmode=true;

    try{
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'our.customer',
            method: 'get_customer_data',
            args: [[],id],  // Add an empty array as `args` to avoid the IndexError
            kwargs: {},

        });
        console.log("this is my updated vendor data" ,result)

        


        result.forEach((customer) => {
            const form = document.getElementById('dropdownForm2');
            if (form) {
                // Populate form fields with customer data using unique IDs
                document.getElementById('customerName').value = customer.name || '';
                this.state.customerdata.name = customer.name || '';
        
                document.getElementById('customerMobile').value = customer.number || '';
                this.state.customerdata.mobile = customer.number || '';
        
                document.getElementById('customerEmail').value = customer.email || '';
                this.state.customerdata.email = customer.email || '';
        
                document.getElementById('customerAddress').value = customer.address || '';
                this.state.customerdata.address = customer.address || '';
        
                document.getElementById('customerCity').value = customer.city || '';
                this.state.customerdata.city = customer.city || '';
        
                document.getElementById('customerState').value = customer.state || '';
                this.state.customerdata.state = customer.state || '';
        
                document.getElementById('customerPincode').value = customer.pincode || '';
                this.state.customerdata.pincode = customer.pincode || '';
            } else {
                console.error("Form with ID 'dropdownForm2' not found in the DOM.");
            }
        });
        
        console.log("this is customer data from updated state", this.state)

    
        

    }
    catch{
      console.log("the error is comming from customer while fetching the data")
    }

     
}



updateoldcustomer=async()=>{
    const id = this.state.updatecustomer_id

    const vals_list={name:this.state.customerdata.name,
        number:this.state.customerdata.mobile,
        email:this.state.customerdata.email,
        address:this.state.customerdata.address,
        city:this.state.customerdata.city,
        state:this.state.customerdata.state,
        pincode:this.state.customerdata.pincode
        
    }

    try{
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'our.customer',
            method: 'update_customer',
            args: [[],id,vals_list],  // Add an empty array as `args` to avoid the IndexError
            kwargs: {},
        });

        console.log("this is the result pof vendor",result)
        this.env.services.notification.add(`${this.state.customerdata.name} Details Updated Successfully `, { type: "success" });
        this.exitpopup()
        this.getcustomerlist();
                

    }
    catch{
        console.log("i got errof from submit customer")
        this.env.services.notification.add("i am get error while update the customer details ", { type: "danger" });
       
    }



}



   //    resetPassword





   onchangeresetpassword=(e)=>{
    if(e && e.target){
        const name=e.target.name
        const value=e.target.value
        if (name=='password'){
            this.state.resetpassword.password=value
          console.log("this is my updated password",this.state)
        }
        else if( name == 'confirmpassword'){
            this.state.resetpassword.confirmpass=value
        }
        
        
        console.log("this is my state " ,this.state)
    }
   }



   resetpassword =async()=>{



    if ( this.state.resetpassword.userid != null && this.state.resetpassword.password != null ){
        if(this.state.resetpassword.userid !=''  &&  this.state.resetpassword.password != '' ){
                 
    if (this.state.resetpassword.password  == this.state.resetpassword.confirmpass){
        const user_id=this.state.resetpassword.userid

        const password=this.state.resetpassword.password

    console.log("this is my send para ", user_id,password)
    try{
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'res.users.password.reset',
            method: 'cus_reset_password',
            args: [[],user_id,password],  // Add an empty array as `args` to avoid the IndexError
            kwargs: {},
        });

        console.log("this is the result updated password",result)

        this.env.services.notification.add("The Password Reset Successfully ", { type: "success" });
    }
    catch{
        console.log("i got errof from update user password")
    }


    }
    else{
                
        this.env.services.notification.add("Pasword and Confirm Password Not Same ", { type: "danger" });

    }

            

        }
        else{
        
            this.env.services.notification.add("Select user and Enter the  New  Password ", { type: "danger" });
        }

   
   

       

    }

    else{
        
        this.env.services.notification.add("Select user and Enter the  New  Password ", { type: "danger" });
    }
    
   }



   getuserlist=async()=>{
    try{
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'our.customer',
            method: 'getuserlist',
            args: [[]],  // Add an empty array as `args` to avoid the IndexError
            kwargs: {},
        });
        const userlist=[]


        result.map((e)=>{
            if(e.id == 1 || e.id == 3 || e.id == 4 || e.id == 5){
                console.log('this is not need')
            }
            else{
                userlist.push({id:e.id , name:e.name , email:e.login})
            }
        })

        console.log("this is the result of get userlist",result)
        console.log("this is the result of get userlist",userlist)
        this.state.userlist =userlist



        this.state.globaldata=userlist
        console.log("------------state length",this.state.userlist.length)

        this.state.table =1
		this.state.currentPage = 1; // Reset to the first page
		this.updatePagination(); // Apply pagination

        console.log("this is table data for user",this.state.globaldata)
    }
    catch{
        console.log("i got errof from get userlist")
    }
    
   }




   getvendorlist=async()=>{
    try{
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'res.partner',
            method: 'getVendor_id',
            args: [[]],  // Add an empty array as `args` to avoid the IndexError
            kwargs: {},
        });
       


        // this.state.tabledata=result
        this.state.userlist =result


        console.log("this is svendor lisyt form userlist ", this.state.userlist)



        this.state.globaldata=result

      

        this.state.table =1
		this.state.currentPage = 1; // Reset to the first page
		this.updatePagination(); // Apply pagination

        console.log("this is table data for user",this.state.globaldata)
    }
    catch{
        console.log("i got errof from get userlist")
    }
    
   }


   getcustomerlist=async()=>{
    try{
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'res.partner',
            method: 'getCustomer_id',
            args: [[]],  // Add an empty array as `args` to avoid the IndexError
            kwargs: {},
        });
      
        // this.state.tabledata =result

        this.state.userlist =result



        this.state.globaldata=result



      

        this.state.table =1
		this.state.currentPage = 1; // Reset to the first page
		this.updatePagination(); // Apply pagination

        console.log("this is table data for user",this.state.globaldata)
    }
    catch{
        console.log("i got errof from get userlist")
    }
    
   }
   
   selecteduser=(e)=>{
    if(e && e.target){
        
        const value=e.target.value
        this.state.resetpassword.userid=value

        console.log("user selected",this.state)

    }   

}




 

   

  
}
SystemSettings.template = "SystemSettings";

