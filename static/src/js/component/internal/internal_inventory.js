/** @odoo-module **/

import { Component, onWillStart, onMounted, useRef,useState ,useEffect,xml} from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";


export class InternalInventory extends Component {
    setup() {
        this.state =useState({
            form:false,
            today:this.fetchdateonly(),
            todayDate:this.fetch_currentdate(),
            partnerlist:[],
            product_list:[],
            formdata1:{},
            bin_location_list:[],
            formData: {
                vendorname: "",
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
            addproduct:[],
            level:0
        })

        this.state.formData.recieveby = session.name;
        this.state.formData.recievebyid=session.uid;

        onWillStart(()=>{
            this.fetchpartnerID();
            this.getproductlist();
            
        })

       

        console.log("-------------my employee and uid",this.employee,this.uid)
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
            method: 'getpartner_id',
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
            { id: this.state.level, product_id: "",product_name:"",bin_location:"", units: "" },
           
            
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
   

    onchangeproduct =(event, proid)=> {
        if (event && event.target) {
            const selectProduct = parseInt(event.target.value, 10);
      
            if(selectProduct != 'select'){
              
                const selectname=(list,product1)=>{
                    const product = list.find(product => product.id === product1);
                    return product ? product.name : ''; // Return the product name or null if not found
                }
                this.state.addproduct = this.state.addproduct.map((data)=>{
                    if (data.id == proid){
                       return {
                        ...data,
                        product_id:selectProduct,
                        product_name:selectname(this.state.product_list,selectProduct)
                       }
                    }
                

                
                console.log("========================Product addded state", this.state)
                
                    return data
                })
    
                console.log('-----------event',{id:proid,productname:selectProduct})
                this.fetchbinlocattion(selectProduct)
                console.log("updated with product name ",this.state.addproduct)

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }



    
    fetchbinlocattion = async(product_id)=>{
  

        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.location',
                method: 'getbin_location',
                args: [[],product_id], // Pass the product ID as an argument
                kwargs: {},
            });
            console.log("Fetched location id list here:", result);
            this.state.bin_location_list = result;
    
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

                console.log("updated with location name ",this.state.addproduct)

            }
            
            
        } else {
            console.error("Event or target is undefined");
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


        const users =this.state.formData

        this.state.formdata1 =[{
            'partner_id': users.vendorname,
            'origin': users.ponumber,
            'user_id': users.recievebyid,
            'origin ':users.ponumber

        }]

        this.state.addproduct.map((data)=>{
            const formdata=this.state.formdata1
            const purchase_vals= [{'is_locked': true, 'priority': '0', 'partner_id': formdata.vendorname, 'picking_type_id': 1, 'location_id': 4, 'location_dest_id': data.product_id, 'scheduled_date': this.state.todayDate, 'origin': formdata.origin, 'picking_properties': [], 'move_ids_without_package': [[0, 0, {'company_id': 1, 'name': data.product_name, 'state': 'draft', 'picking_type_id': 1, 'move_line_ids': [], 'location_id': 4, 'location_dest_id': data.bin_location, 'partner_id': formdata.vendorname, 'additional': false, 'product_id': data.product_id, 'description_picking': data.formdata1, 'date': this.state.todayDate, 'product_uom_qty': data.units, 'quantity': 0, 'product_uom': 1, 'picked': false}]], 'package_level_ids': [], 'move_type': 'direct', 'user_id': formdata.user_id, 'note': false}]
           this.stepbysteb_creation(purchase_vals)
        
        }
    
    
    )

     
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
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    
    

    }

    
    
}
InternalInventory.template = 'InternalInventory'



document.querySelectorAll('.input-group input, .input-group textarea').forEach(input => {
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
    input.addEventListener('input', handleInput);
});

function handleFocus(event) {
    const label = event.target.closest('.input-group').querySelector('label');
    if (label) {
        label.classList.add('focused');
    }
}

function handleBlur(event) {
    const label = event.target.closest('.input-group').querySelector('label');
    if (label && event.target.value === '') {
        label.classList.remove('focused');
    }
    validateInput(event.target); // Blur olayında da input'u validate ediyoruz
}

function handleInput(event) {
    validateInput(event.target); // Input girildiğinde validasyon yapılıyor
}

function validateInput(input) {
    if (input.checkValidity()) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
    }
}

// document.getElementById('contactForm').addEventListener('submit', function(event) {
//     event.preventDefault(); // Formun gönderilmesini engeller

    // const formIsValid = [...document.querySelectorAll('.input-group input, .input-group textarea')].every(input => {
    //     return input.checkValidity();
    // });

    // const notification = document.createElement('div');
    // notification.className = 'notification';

    // if (formIsValid) {
    //     notification.classList.add('success');
    //     notification.innerText = `Thank you for contacting us! We will get back to you soon.`;
    //     document.getElementById('contactForm').reset(); // Formu sıfırla
    //     document.querySelectorAll('.input-group label').forEach(label => label.classList.remove('focused'));
    // } else {
    //     notification.classList.add('error');
    //     notification.innerText = 'Please fill out all fields correctly before submitting the form.';
    // }

//     document.body.appendChild(notification);

//     setTimeout(() => {
//         notification.remove();
//     }, 5000);
// });
