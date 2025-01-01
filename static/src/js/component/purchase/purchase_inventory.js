/** @odoo-module **/

import { Component, onWillStart, onMounted, useRef,useState ,useEffect,xml} from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";


export class PurchaseInventory extends Component {
    setup() {
        this.state =useState({

           
            createmessage:null,
            tableproduct:'',
            form:true,
            today:this.fetchdateonly(),
            todayDate:this.fetch_currentdate(),
            partnerlist:[],
            product_list:[],
            formdata1:{},
            bin_location_list:[],
            formData: {
                vendorname: null,
                operationtype: "",
                recieveby: "",
                recievebyid:"",
                ponumber: "",
                cusname: "",
                drivername: "",
                vnumber: "",
                date: "",
            },

            purchase_vals: [{'is_locked': true, 'priority': '0', 'partner_id': "CUSTOMER NAME", 'picking_type_id': 1, 'location_id': 4, 'location_dest_id': "DESTINATION", 'scheduled_date': 'DATETODAY', 'origin': 'POCODE', 'picking_properties': [], 'move_ids_without_package': [[0, 'virtual_20', {'company_id': 1, 'name': '[2124] Apple', 'state': 'draft', 'picking_type_id': 1, 'move_line_ids': [], 'location_id': 4, 'location_dest_id': 27, 'partner_id': 28, 'additional': false, 'product_id': 5, 'description_picking': 'Apple', 'date': '2024-12-01 10:31:29', 'product_uom_qty': 125, 'quantity': 0, 'product_uom': 1, 'picked': false}]], 'package_level_ids': [], 'move_type': 'direct', 'user_id': 2, 'note': false}],
            addproduct:[{id:1,product_id:"",product_name:"",bin_locationlist:[],units:""}],
            level:1,
            error_addproduct:null,
            error_vendor:null
        })

        this.state.formData.recieveby = session.name;
        this.state.formData.recievebyid=session.uid;

        onWillStart(()=>{
            this.fetchpartnerID();
            this.getproductlist();
            
        })

       

        console.log("-------------my employee and uid",this.employee,this.uid)
    }



    
    onclickwarning=(id)=>{
        this.state.warning=true
        this.state.removerowid=id
    }


    approvalremove=()=>{
        this.removebox(this.state.removerowid)
        this.state.warning=false
    }


    exitwarningpopup =()=>{
        this.state.warning=false
    }
    




    
    
    button_click_for_form=()=>{
        this.state.form=true
    }



    fetchdateonly=()=>{
    
        const now = new Date();

        // Extract and format the date components
        const day = String(now.getDate()).padStart(2, '0'); // Get day (DD)
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Get month (MM, months are zero-indexed)
        const year = now.getFullYear(); // Get year (YYYY)

        return `${day}-${month}-${year}`
      
   
    }


    fetch_currentdate=()=>{
            const now = new Date();

            // Extract and format the date components
            const day = String(now.getDate()).padStart(2, '0'); // Get day (DD)
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Get month (MM, months are zero-indexed)
            const year = now.getFullYear(); // Get year (YYYY)

            const dateonly=  `${day}-${month}-${year}`
    
            // Extract and format the time components
            const hours = String(now.getHours()).padStart(2, '0'); // Get hours (HH)
            const minutes = String(now.getMinutes()).padStart(2, '0'); // Get minutes (MM)
            const seconds = String(now.getSeconds()).padStart(2, '0'); // Get seconds (SS)

            // Combine into the desired format
            const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;



            return formattedDateTime
    }



    fetchpartnerID = async()=>{
        

    try {
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'res.partner',
            method: 'getVendor_id',
            args: [[]], // Pass the product ID as an argument
            kwargs: {},
        });
        console.log("Fetched partner id list here:", result);
        this.state.partnerlist = result;

        console.log("after update partner id its state",this.state)


    } catch (error) {
        console.error("Error fetching parrtner id :", error);
    }

}           


    addproducts = () => {
        // Increment the level and add a new product object
        this.state.level += 1;
        this.state.addproduct = [
            ...this.state.addproduct,
            { id: this.state.level, product_id: "",product_name:"",bin_location:"", bin_locationlist:[],location_count:"",units: "" },
           
            
        ];
    
        console.log("Updated products list:", this.state.addproduct);
    };


    
    removebox = (id) => {
        // Filter out the product with the specified ID
        const updatedProducts = this.state.addproduct.filter(product => product.id !== id);
    
        // Reassign sequential IDs to maintain consistency
        const reindexedProducts = updatedProducts.map((product, index) => ({
            ...product,
            id: index + 1 // Reassign IDs starting from 1
        }));
    
        // Update the state
        this.state.addproduct = reindexedProducts;
    
        // Reset the level to match the new length
        this.state.level = reindexedProducts.length;
    
        console.log("Updated product list after removal:", this.state.addproduct);
    };


    async getproductlist() {
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.location',
                method: 'get_existing_productlist',
                args: [[]],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                },
            });
    
            if (result && Array.isArray(result)) {
                // Only set the state if result is an array
                this.state.product_list = result;
                console.log("product list:", this.state.product_list);
            } else {
                console.error("Unexpected error in format:", result);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }
   

    onchangeproduct =(event, rowid)=> {
        if (event && event.target) {
            const selectProduct = parseInt(event.target.value, 10);
      
            if(selectProduct != 'select'){
              
                const selectname=(list,product1)=>{
                    const product = list.find(product => product.id === product1);
                    return product ? product.name : ''; // Return the product name or null if not found
                }
                this.state.addproduct = this.state.addproduct.map((data)=>{
                    if (data.id == rowid){
                       return {
                        ...data,
                        product_id:selectProduct,
                        product_name:selectname(this.state.product_list,selectProduct)
                       }
                    }
                

                
                console.log("========================Product addded state", this.state)
                
                    return data
                })
    
                console.log('-----------event',{id:rowid,productname:selectProduct})
                this.fetchbinlocattion(selectProduct,rowid)
                this.state.tableproduct=selectProduct
                console.log("updated with product name ",this.state.addproduct)

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }



    
    fetchbinlocattion = async(product_id,rowid)=>{
  

        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.location',
                method: 'getbin_location',
                args: [[],product_id], // Pass the product ID as an argument
                kwargs: {},
            });
            console.log("Fetched location id list here:", result);

            this.state.addproduct = this.state.addproduct.map((data)=>{
                if (data.id == rowid){
                   return {
                    ...data,
                    bin_locationlist:result,
                    
                   }
                }
                return data
            })
            // this.state.bin_location_list = result;
    
            console.log("after update bin location its state",this.state)
    
    
        } catch (error) {
            console.error("Error fetching location id :", error);
        }
    
    } 
    
    
    onchangelocation =(event, proid)=> {
        if (event && event.target) {
            const selectlocation = parseInt(event.target.value, 10);
      
            if(selectlocation != 'select'){
              
                
                this.state.addproduct = this.state.addproduct.map((data)=>{
                    if (data.id == proid){
                       return {
                        ...data,
                        bin_location:selectlocation
                       }
                    }


                console.log("========================Product addded state", this.state)
                
                    return data
                })
    
                console.log('-----------event',{id:proid,bin_location:selectlocation})
                this.update_location_count(proid,selectlocation)

                console.log("updated with location name ",this.state.addproduct)

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }


    update_location_count= async (proid,location_id)=>{
        const product_id_vals=this.state.tableproduct

        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.quant',
                method: 'get_location_count_for_table',
                args: [[],product_id_vals,location_id], // Pass the product ID as an argument
                kwargs: {},
            });
            console.log("Fetched location count here:", result);

            if(true){

         
           
            this.state.addproduct = this.state.addproduct.map((data)=>{
                    if (data.id == proid){
                       return {
                        ...data,
                        location_count:result
                       }
                       
                    }
    
                    return data
    
                });
            }


    }
    catch (error) {
        console.error("Error fetching location count  :", error);
    }
}



    vendorchange =(event)=>{
        if (event && event.target) {

            if(event.target.value != 'select'){

            const selectedPartner = parseInt(event.target.value, 10);
            this.state.formData.vendorname=selectedPartner
        

            console.log("updated with parent name ",this.state)

            }
            else{
                
             console.log("select valid Partner")

            }  
        } else {
            console.error("Event or target is undefined");
        }
    }



     submitproduct_inward=async()=> {

      
        var CheckRow=0

        if (this.state.formData.vendorname != null ) 
            {
                if (this.state.addproduct.length >0){
                    this.state.addproduct.map((data)=>{


                        
                        if(data.product_name == '' && data.units == '' && data.bin_location == '') {

                           this.env.services.notification.add(` Row ${data.id} is need product , location and Qty `, { type: "danger" });  
                        }
                        else  if( data.product_name == '' && data.units != '' && data.bin_location != ''){
                           this.env.services.notification.add(` Row ${data.id} is need product `, { type: "danger" });  

                        }
                        else  if( data.product_name != '' && data.units != '' && data.bin_location == ''){
                            this.env.services.notification.add(` Row ${data.id} is need Bin Location `, { type: "danger" });  
 
                         }
                         else  if( data.product_name != '' && data.units == '' && data.bin_location != ''){
                            this.env.services.notification.add(` Row ${data.id} is need Qty `, { type: "danger" });  
 
                         }
                         else  if( data.product_name == '' && data.units == '' && data.bin_location != ''){
                            this.env.services.notification.add(` Row ${data.id} is need product and Qty `, { type: "danger" });  
 
                         }
                         else  if( data.product_name == '' && data.units != '' && data.bin_location == ''){
                            this.env.services.notification.add(` Row ${data.id} is need product and Bin location `, { type: "danger" });  
 
                         }
                         else  if( data.product_name != '' && data.units == '' && data.bin_location == ''){
                            this.env.services.notification.add(` Row ${data.id} is need Bin Location and Qty  `, { type: "danger" });  
 
                         }
                      
    
                        else {
                            if (data.units > 0){
                                CheckRow+=1
                            }
                            else{
                                this.env.services.notification.add(` Row ${data.id} is need Minimum 1 Qty  `, { type: "danger" });
                            }
                                
                        }


                    })


                console.log("----------------------------this is my check row value",CheckRow)
                if (CheckRow == this.state.addproduct.length){


                    
                    const users =this.state.formData

                    this.state.formdata1 =[{
                        'partner_id': users.vendorname,
                        'origin': users.ponumber,
                        'user_id': users.recievebyid,
                    
            
                    }]
            
                    this.state.addproduct.map((data)=>{
                        const formdata=this.state.formdata1[0];
                        const purchase_vals= [{'is_locked': true, 'priority': '0', 'partner_id': 2,'vendor_id': formdata.partner_id, 'picking_type_id': 1, 'location_id': 4, 'location_dest_id': data.product_id, 'scheduled_date': this.state.todayDate, 'origin': formdata.origin, 'picking_properties': [], 'move_ids_without_package': [[0, 0, {'company_id': 1, 'name': data.product_name, 'state': 'draft', 'picking_type_id': 1, 'move_line_ids': [], 'location_id': 4, 'location_dest_id': data.bin_location, 'partner_id': 2,'vendor_id': formdata.partner_id, 'additional': false, 'product_id': data.product_id, 'description_picking': data.formdata1, 'date': this.state.todayDate, 'product_uom_qty': data.units, 'quantity': 0, 'product_uom': 1, 'picked': false}]], 'package_level_ids': [], 'move_type': 'direct', 'user_id': formdata.user_id, 'note': false}]
                       this.stepbysteb_creation(purchase_vals)
                    
                    }
                
                
                )
                }

                else{
                    this.env.services.notification.add("Fill All Opened Rows Details Correctly.", { type: "danger" });
                }
                }

                else{
                   
                    this.env.services.notification.add("Add Atleast one Row.", { type: "danger" });

                    

                  
                  
                   
               }

                   
            }
           else {

        console.log("this is my name ")

            this.state.error_vendor = 'Please Select Vendor Name'

            setTimeout(() => {
              
               this.state.error_vendor=null
               
           }, 5000);

            }

      

     
    }

    
    stepbysteb_creation = async(valus)=>{

        console.log('sending file is purchase vals',valus )

        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.picking',
                method: 'create',
                args: [valus],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                },
            });


            console.log("-----------------------------------hey its id",result)


             const result1=await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.picking',
                method: 'button_validate', // Use the public method
                args: [result], // Provide the picking ID as argument
                kwargs: {},
   
    
            });
    
    
            console.log("i am not ready to sleep",result1)

            this.env.services.notification.add('Stock Inward Successfully Updated ', { type: "success" });
           

            // const popup = document.getElementById('successPopup');
            // popup.style.display = 'block';

            // // Hide the popup after 3 seconds
            // setTimeout(() => {
            //     popup.style.display = 'none';
            // }, 3000);

            
            this.state.formData= {
                vendorname: "",
                operationtype: "",
                recieveby: "",
                recievebyid:"",
                ponumber: "",
                cusname: "",
                drivername: "",
                vnumber: "",
                date: "",
            }
            this.state.formData.recieveby = session.name;
            this.state.formData.recievebyid=session.uid;





            this.state.addproduct=[]
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    
    

    }


    get_location_count_for_table


    get_location_counts_for_table = async(product_id,location_id)=>{

        console.log('sending file is purchase vals',valus )

        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.quant',
                method: 'get_location_count_for_table',
                args: [product_id,location_id],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                },
            });


            console.log("-----------------------------------hey its id",result)
        }
        catch (error) {
            console.error("Error fetching location count for table:", error);
        }

    };
}
      



PurchaseInventory.template = 'PurchaseInventory'


