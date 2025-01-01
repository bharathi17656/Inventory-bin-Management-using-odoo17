/** @odoo-module **/

import { Component, onWillStart, onMounted, useRef,useState ,useEffect,xml} from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";

export class ProductPage extends Component {
    setup() {
        this.state =useState({

            table:0,
            filteredTableData:[],
            globaldata:[],
            popupmode:false,  
            currentPage: 1, // The current page being viewed
			pageSize: 10, // Number of rows per page
			totalPages: 0, // Total number of pages
            uom_list:[],
            category_list:[],
            getproductdetails :[],
            productform:{
                name:null,
                code:null,
                std_price:null,
                image:null,
                selectuom:1,
                selectcategory:1,
                
            },
            selectproductid:null,



            imagepreview:null,
            imagenotfound:true,



            form_error:{
                error_name:null,
                error_code:null,
                error_std:null,
                error_cate:null,
                error_uom:null

            }
        })


        onWillStart(()=>{
            this.fetchselectdata();
            this.getproductlist();
        })

    }


    exitpopup=()=>{
        this.state.popupmode=false
        this.state.imagenotfound=true
        this.state.productform.image=null
    }


    updateproductpage =async(id)=>{
        this.state.popupmode = true;
        this.state.selectproductid=parseInt(id)
        console.log('this is the starting state ', this.state.productform)


        try{
            const result =  await jsonrpc('/web/dataset/call_kw', {
                model: 'product.template',
                method: 'getupdateproductlist',
                args: [[],id],
                kwargs: {},
            });
           
            console.log("this is my result under by product",result)

            if (result && result.length > 0) {
                const product = result[0]; // Assuming only one product is returned
                const form = document.getElementById('dropdownForm5'); // Get the form by ID
                if (form) {
                    // Populate form fields
                    form.querySelector('input[name="name"]').value = product.product_name?.['en_US'] || '';

                    this.state.productform.name=product.product_name?.['en_US'] || '';

                    form.querySelector('input[name="code"]').value = product.code || '';
                    this.state.productform.code=product.code || '';
                    form.querySelector('input[name="std"]').value = product.price || '';
                    this.state.productform.std_price=product.price || '';
    
                    // Handle the image preview
                   
                    const imagePreview = document.getElementById('imagePreview');
                    
                    if (imagePreview && product.image!=null) {
                        this.state.imagenotfound=false
                        console.log("this is my product image ",product.image)
                        this.state.productform.image=product.image;
                        // imagePreview.src = product.image ? `data:image/png;base64,${product.image}` : 'apple.jpg';
                       
                        console.log('check up for the previewimage',imagePreview.src)
                        imagePreview.style.display = 'block'; // Show the image preview
                    }



                    const uomSelect = form.querySelector('select[name="uom"]');
                    this.state.productform.selectuom=product.uom_id
                    console.log('check up for the selected listu',uomSelect)
                    if (uomSelect) {
                        const options = uomSelect.options;
                        console.log("this is our option",options)
                        for (let i = 0; i < options.length; i++) {
                            console.log('my options and value ', options[i].value,options[i],product.uom_id)
                            if (parseInt(options[i].value) === product.uom_id) {
                                console.log("selected list in my list",options[i])
                                options[i].selected = true; // Mark the matching option as selected
                                break;
                            }
                        }}

                    
                }
    
                
            }


            console.log("this is my list state after the update of product",this.state)
        }
        
        catch{
            alert("this is not working ptoblem in product update page")

        }




    }


    onsubmitupdateproduct=async()=>{
        try{
            console.log("this is my sent product details",this.state.productform,this.state.selectproductid)
            if(this.state.selectproductid != null){
                const id = this.state.selectproductid
                const pro=this.state.productform

                
                const vals = {
                    name: pro['name'] ,
                    default_code: pro['code'],
                    uom_id: pro['selectuom'],
                    list_price: pro['std_price'],
                    baseimage: pro['image'],
                    categ_id: pro['selectcategory']
                };
    
                console.log("This is my updated sending vals:", vals);
    




                const result =  await jsonrpc('/web/dataset/call_kw', {
                    model: 'res.partner',
                    method: 'updateproductpage',
                    args: [[],id,vals],
                    kwargs: {},
                });
               
                console.log("this is my result under by product",result)
                this.getproductlist();


                this.env.services.notification.add("Product Updated Successfully ", { type: "success" });


                this.exitpopup()

            }

        }
        catch{
            alert("i got error from update vals")
        }
    }

    previewImage() {

        this.state.imagehere=true;
        this.state.imagenotfound=false;

        console.log("this is product selection after the update of state",this.state.productform.image)

        if (this.state.productform.image != null){
            console.log("i am here from the preview of update")
              

                imagePreview.style.display = "block";
            };
          
        }
    
   


    globalsearch = (e) => {
        const searchInput = e.target.value.toLowerCase(); // Convert the search input to lowercase

        // Filter the product list based on the search input
         const filteredData = this.state.getproductdetails.filter(product => {
        // Check if the search input matches any of the relevant fields
        return (
            (product.name.en_US && product.name.en_US.toLowerCase().includes(searchInput)) || // Check if 'name' contains the search input
            (product.default_code && product.default_code.toLowerCase().includes(searchInput)) || // Check if 'default_code' contains the search input
            (product.list_price && product.list_price.toString().includes(searchInput)) // Check if 'list_price' contains the search input (converted to string for comparison)
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




        onchangeproductform =(e)=>{
            if( e && e.target){
               const name = e.target.name
               const value=e.target.value

               if (name == 'name'){
                this.state.productform.name=value
               }
               else if (name == 'code'){
                this.state.productform.code=value
               }
               else if (name == 'std'){
                this.state.productform.std_price=value
               }
               else if (name == 'list'){

                this.state.ProductPage.list_price=value

               }
               else if (name === "img") {
                const file = e.target.files[0]; // Get the uploaded file
                console.log("Image file selected:", file);
                this.imageformatchange(file); // Call the 
                // function to convert to Base64
               
                


                console.log("this is updated state 12345678",this.state)
                
            }
            }
        }



        selectedlist = (e)=>{


            if(e && e.target){

                const name = e.target.name
               const value=e.target.value

               if (name == 'uom'){


                this.state.productform.selectuom=parseInt(value)
                console.log("this is my product state" ,this.state)
               }
               else if (name == 'category'){
                this.state.productform.selectcategory=parseInt(value)
                console.log("this is my product state" ,this.state)
               }
            }

        }



        // 'uom_id': 1, 
        // 'categ_id': 1,
        // 'uom_po_id': 1,

    


        // Validation function
    validateProductForm() {
    const errors = {
        error_name: null,
        error_code: null,
        error_std: null,
        error_cate: null,
        error_uom: null,
    };

    const { name, code, std_price, selectuom, selectcategory } = this.state.productform;

    // Check each field and set appropriate error messages
    if (!name || name.trim() === '') {
        errors.error_name = 'Product name cannot be empty.';
    }

    if (!code || code.trim() === '') {
        errors.error_code = 'Product code cannot be empty.';
    }

    if (!std_price || isNaN(std_price) || parseFloat(std_price) <= 0) {
        errors.error_std = 'Standard price must be a valid positive number.';
    }

    if (!selectcategory) {
        errors.error_cate = 'Please select a product category.';
    }

    if (!selectuom) {
        errors.error_uom = 'Please select a unit of measure.';
    }

    // Update the form_error state
    this.state.form_error=errors

    // If there are any errors, reset them after 5 seconds
    if (Object.values(errors).some((error) => error !== null)) {
        setTimeout(() => {
           this.state.form_error= {
                error_name: null,
                error_code: null,
                error_std: null,
                error_cate: null,
                error_uom: null,
           }
 
        }, 5000);
    }

    // Return true if no errors, otherwise false
    return Object.values(errors).every((error) => error === null);
}

// Usage Example
 onSubmitForm() {
   
}


        onsubmitproduct= async ()=>{

            const isValid = this.validateProductForm(); // Call the validation function

            if (isValid) {
                console.log('Form is valid. Proceed with submission.');
                // Submit the form or execute desired action
            

            

            const vals=[{'attribute_line_ids': [], 'type': 'product', 'company_id': false, 'tracking': 'none','priority': '0', 'name': this.state.productform.name, 'sale_ok': true, 'purchase_ok': true, 'active': true, 'detailed_type': 'product', 'uom_id': this.state.productform.selectuom, 'uom_po_id': this.state.productform.selectuom, 'list_price': this.state.productform.std_price, 'taxes_id': [[4, 1]], 'standard_price': 0, 'categ_id':this.state.productform.selectcategory, 'default_code': this.state.productform.code, 'barcode': false, 'product_tag_ids': [], 'product_properties': [{'name': '411aa30b7bfde291', 'type': 'char', 'string': 'Property 1', 'value': false}], 'description': false, 'description_sale': false, 'seller_ids': [], 'supplier_taxes_id': [], 'purchase_method': 'receive', 'description_purchase': false, 'route_ids': [[4, 5]], 'responsible_id': 2, 'weight': 0, 'volume': 0, 'sale_delay': 0, 'property_stock_production': 15, 'property_stock_inventory': 14, 'description_pickingin': false, 'description_pickingout': false, 'description_picking': false , 'baseimage':this.state.productform.image}]


            // [{'attribute_line_ids': [], 'type': 'product', 'company_id': False, 'tracking': 'none', 'image_1920': False, 'priority': '0', 'name': '30 shot', 'sale_ok': True, 'purchase_ok': True, 'active': True, 'detailed_type': 'product', 'list_price': 300, 'taxes_id': [[4, 1]], 'standard_price': 250, 'categ_id': 1, 'default_code': False, 'barcode': False, 'product_tag_ids': [], 'product_properties': [], 'description': False, 'description_sale': False, 'seller_ids': [], 'supplier_taxes_id': [[4, 2]], 'purchase_method': 'receive', 'description_purchase': False, 'route_ids': [[4, 5]], 'responsible_id': 2, 'weight': 0, 'volume': 0, 'sale_delay': 0, 'property_stock_production': 15, 'property_stock_inventory': 14, 'description_pickingin': False, 'description_pickingout': False, 'description_picking': False}]



            try {
                const result = await jsonrpc('/web/dataset/call_kw', {
                    model: 'product.template',
                    method: 'create',
                    args: [vals], 
                    kwargs: {},
                });


                console.log("this is my product updated result", result)
                this.getproductlist();


                this.env.services.notification.add("Product Created Successfully ", { type: "success" });


                this.onclearform()

            }
            catch {
                console.log("peoblem found in the product creation")
            }

        } else {
            console.log('Form is invalid. Errors:', this.state.form_error);
        }


        }



        onclearform = ()=>{


            const form = document.getElementById('dropdownForm');

            // Reset the values of all input fields within the form
            if (form) {
                const inputs = form.querySelectorAll('input');
                inputs.forEach(input => {
                    input.value = ''; // Clear the value of each input
                });
            }


            this.state.uom_list=[]
            this.state.category_list=[]
           

            this.fetchselectdata();


        }



        fetchselectdata = async()=>{
        

            try {
                const uom = await jsonrpc('/web/dataset/call_kw', {
                    model: 'product.template',
                    method: 'get_uom_list',
                    args: [[]], 
                    kwargs: {},
                });


                const category = await jsonrpc('/web/dataset/call_kw', {
                    model: 'product.template',
                    method: 'getproduct_gategory',
                    args: [[]],
                    kwargs: {},
                });



                console.log("Fetched uom and category id list here:", uom,category);
                this.state.uom_list=uom
                this.state.category_list = category
        
               
        
        
            } catch (error) {
                console.error("Error fetching uom and category id :", error);
            }
        
        }         



        imageformatchange = (file) => {
            if (file) {
                const reader = new FileReader();
        
                // Event listener for when the file is successfully read
                reader.onload = (event) => {
                    const base64String = event.target.result.split(",")[1]; // Get Base64 string
                    this.state.productform.image = base64String; // Save Base64 string in state
                    console.log("Base64 Image String:", base64String);
                    this.previewImage()
                };
        
                // Read the file as a Data URL
                reader.readAsDataURL(file);
               
            } else {
                alert("No file selected");
            }
        };



        getproductlist =async()=>{
            


            try {
                const result = await jsonrpc('/web/dataset/call_kw', {
                    model: 'product.template',
                    method: 'getproductdetails',
                    args: [[]],
                    kwargs: {},
                });

                console.log("i got product details list ",result)

                this.state.getproductdetails=result

                this.state.globaldata=result


                this.state.table =1
                this.state.currentPage = 1; // Reset to the first page
                this.updatePagination(); // Apply pagination
        

            }
            catch{

                console.log("its is probem in getproduct list")

            }
        }


    





}

ProductPage.template='ProductPage'