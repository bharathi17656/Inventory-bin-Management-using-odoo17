/* @odoo-module */
import { Component, onWillStart, onMounted, useRef,useState ,useEffect} from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";


export class NewBinManagement extends Component {
    setup() {
        this.state = useState({
            warehouse_list:[],
            child_list:[],
            rack_list:[],
            product_list:[],
            parent:0,
            child:0,
            rack_name:0,
           location_id:0,
            bin_details: [],
            row: 0,
            col: 0,
            total_bin: 0,
            grid:"1fr",
            message:0,
            error_warehouse:null,
            error_rackname:null,
            error_submit:null,
            error_clear:null,
            error_bin:null,
            error_col:null,
            error_row:null,
            error_row_col:null,
            error_bin_details:null
        });

        this.onWarehouseChange = this.onWarehouseChange.bind(this);
        this.onWarehouseChildChange = this.onWarehouseChildChange.bind(this);
        this.onchangeproduct = this.onchangeproduct.bind(this);

        onWillStart(async () => {
            await this.getWarehouselist();
            await this.getproductlist(); 
            await this.getChildWarehouselist();
        
    })


        useEffect(() => {
            const columns = parseInt(this.state.col, 10) || 1;  // Ensure col is a number and fallback to 1
            this.state.grid = Array(columns).fill('1fr').join(' ');
            console.log("---------------------?state",this.state)
        });
    

        this.binContainerRef = useRef("binContainer");

        // Watch for changes in row and col to update total_bin and bin_details
        useEffect(() => {
            this.state.total_bin = this.state.row * this.state.col;
            this.updateBinDetails();
            this.updateGridColumns();
        }, () => [this.state.row, this.state.col]); // Recalculate when row or col changes
    }

    async getWarehouselist() {
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.warehouse',
                method: 'get_existing_warehouse',
                args: [[]],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {},
            });
    
            if (result && Array.isArray(result)) {
                // Only set the state if result is an array
                this.state.warehouse_list = result;
                console.log("Warehouse list:", this.state.warehouse_list);
            } else {
                console.error("Unexpected data format from parent :", result);
            }
        } catch (error) {
            console.error("Error fetching warehouse parent :", error);
        }
    }
    

    async getracklist(child){
        try{
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.storage.category',
                method: 'get_rack_list',
                args: [[]],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                    num:child
                },
            });
    
            if (result && Array.isArray(result)) {
                // Only set the state if result is an array
                this.state.rack_list = result;
                console.log("rack list:", this.state.rack_list);
            } else {
                console.error("Unexpected data format from child :", result);
            }
        } catch (error) {
            console.error("Error fetching warehouse child :", error);
        }
    }

    onWarehouseChange = (event)=> {
        if (event && event.target) {
            const selectedParent1 = event.target.value;
            console.log("selected parent",selectedParent1)
            if(selectedParent1 != 'select'){
                if (selectedParent1 != null){
                    const selectedParent = parseInt(selectedParent1, 10); 
                    this.state.parent = selectedParent
                    console.log("current with parent name ",this.state.parent)
                    this.getChildWarehouselist(selectedParent)
                }
                else{
                    this.state.parent = selectedParent1
                    console.log("current with parent name ",this.state.parent)
                    this.getChildWarehouselist(selectedParent1)
                }
               

          


              
               

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }

    onWarehouseChildChange = (event)=> {
        if (event && event.target) {
        
            const selectedchild = parseInt(event.target.value, 10);
      
            if(selectedchild != 'select'){

                
                this.state.child = selectedchild
                console.log("current with child name ",this.state.child)
                this.getracklist(selectedchild)

             

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }

    onrackChange = (event)=> {
        if (event && event.target) {
        
            const selectedrack = parseInt(event.target.value, 10);
      
            if(selectedrack != 'select'){

                
                this.state.rack_name = selectedrack
                console.log("current with rack name ",this.state.rack_name)
                console.log(" current state ",this.state)

             

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }

    
    

    


    async getChildWarehouselist(data) {
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.warehouse',
                method: 'get_existing_warehouse',
                args: [[]],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                    parent : data
                },
            });
    
            if (result && Array.isArray(result)) {
                // Only set the state if result is an array
                this.state.child_list = result;
                console.log("Warehouse child:", this.state.child_list);
            } else {
                console.error("Unexpected data format from child parent:", result);
            }
        } catch (error) {
            console.error("Error fetching warehouse child:", error);
        }
    }

    updateBinDetails() {
        // Generate bin details based on total_bin, row, and col values
        const bins = [];
        for (let i = 1; i <= this.state.total_bin; i++) {
            bins.push({ id: i, name: `Bin ${i}`, row: Math.ceil(i / this.state.col), col: i % this.state.col || this.state.col , product_id:null, bin_available: true});
        }
        this.state.bin_details = bins;
        console.log("------------------main product updated bin row,col",bins)
    }

    updateGridColumns() {
        // Set grid-template-columns dynamically based on col value
        if (this.binContainerRef.el) {
            this.binContainerRef.el.style.gridTemplateColumns = `repeat(${this.state.col}, 1fr)`;
        }
    }

    clearBins() {
        this.state.warehouse_list = '';
        this.state.rack_name = '';
        this.state.row = 0;
        this.state.col = 0;
        this.state.total_bin = 0;
        this.state.bin_details = [];
    }

    

    async getproductlist() {
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.location',
                method: 'get_existing_products',
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
              
                
                this.state.bin_details = this.state.bin_details.map((data)=>{
                    if (data.id == proid){
                       return {
                        ...data,
                        product_id:selectProduct
                       }
                    }


                console.log("========================Product addded state", this.state)
                    return data
                })
    
                console.log('-----------event',{id:proid,productname:selectProduct})

                console.log("updated with parent name ",this.state.bin_details)

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }
    async createRecordDetails(){

        const para2={
            rack_id:this.state.rack_name,
            rack_row:this.state.row,
            rack_col:this.state.col,
            grid_name:this.state.grid
            
        }

        console.log("------------------------record creating details successfully", para2)

        try{
        
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'stock.location.details',
            method: 'create_new_bin_details',
            args: [para2],  // Add an empty array as `args` to avoid the IndexError
            kwargs: {
                
            },
        });

        if (result) {
            // Only set the state if result is an array
            console.log("================================>result bin details ",result)

        } else {
            console.error("Unexpected error in result:", result);
        }

    
} catch (error) {
    console.error("Error fetching products:", error);
}


        
    }

    async createBins(){


        if (this.state.child >0 && this.state.child != null){

            if(this.state.rack_name > 0 && this.state.rack_name != null){

                if ( this.state.row > 0 && this.state.col >0){
                    
                    if(this.state.total_bin > 0) {
                        if  (this.state.bin_details.length > 0) {


                            console.log('-------------------this.statefor create',this.state)


        this.state.child_list.map( async (data)=>{
            if (data.id == this.state.child){
                
                console.log('i am ready ------------->123')

                const location_id = await jsonrpc('/web/dataset/call_kw', {
                    model: 'stock.warehouse',
                    method: 'get_stock_lot_record_id',
                    args: [[]],  // Add an empty array as `args` to avoid the IndexError
                    kwargs: {
                       data:data.id
                    },
                });

                console.log('-------------------------------------stock location value',location_id)

                 location_id.map(a=>{
                    this.state.location_id=a.id
                })                
                console.log('============================stock location id is ',this.state.location_id)
                
                this.recordcreation()
                
        


            }
            
        });

       

                        }
                        else{
                            this.state.error_bin_details = "Please Enter Valid Bin Details "
                            setTimeout(() => {
                                this.state.error_bin_details=null
                            }, 5000);
                        }

                    }

                }
                else{

                    if(this.state.row > 0 && this.state.col == 0){
                        this.state.error_col="Please Enter Valid Column "
                        setTimeout(() => {
                            this.state.error_col=null
                        }, 5000);
                    }
                    else  if(this.state.row == 0 && this.state.col > 0){
                        this.state.error_row="Please Enter Valid Row "
                        setTimeout(() => {
                            this.state.error_row=null
                        }, 5000);
                    
                    }
                    else{
                       
                            this.state.error_row_col="Please Enter Valid Column and Row "
                            setTimeout(() => {
                                this.state.error_row_col=null
                            }, 5000);
                        }
                    }
                    
                }

            else{

                this.state.error_rackname="Please Select Valid Rack Name "
                        setTimeout(() => {
                            this.state.error_rackname=null
                        }, 5000);

            }

        }
        else{
            this.state.error_warehouse="Please Select Valid Column " 
                        setTimeout(() => {
                            this.state.error_warehouse=null
                        }, 5000);
                    
        }

        

     
        
    }

    recordcreation(){

        try {

            this.state.bin_details.map( async (data)=>{
                const para1={
                    company_id: 1,
                    name:data.name, 
                    location_id:this.state.location_id,
                    order_id:data.id,
                    bin_row:data.row,
                    bin_col:data.col,
                    usage: 'internal',
                    product_id:data.product_id,
                    storage_category_id:this.state.rack_name,
                    bin_available:data.bin_available,
                    scrap_location: false, 
                    return_location: false, 
                    replenish_location: false, 
                    cyclic_inventory_frequency: 0, 
                    comment: false,
                    active: true

                }

                

                console.log("------------------------>record creating para1",para1)

                const result = await jsonrpc('/web/dataset/call_kw', {
                    model: 'stock.location',
                    method: 'create',
                    args: [[para1]],  // Add an empty array as `args` to avoid the IndexError
                    kwargs: {
                       
                    },
                });
        
                if (result) {
                    // Only set the state if result is an array
                    console.log("================================>result",result)

                    const ruleway = {
                        package_type_ids: [],
                        product_id:data.product_id,
                        location_in_id:this.state.location_id,
                        location_out_id:result[0],
                        storage_category_id:this.state.rack_name
                    }

            

                    const result1= await jsonrpc('/web/dataset/call_kw', {
                        model: 'stock.putaway.rule',
                        method: 'createrule',
                        args: [ruleway],  // Add an empty array as `args` to avoid the IndexError
                        kwargs: {
                           
                        },
                    });


                    console.log("Record created Successfully and putaway rule also updated ",result1);


                } else {
                    console.error("Unexpected error in result:", result);
                }

            })
            console.log("-----------------------------ready to create bin details123")
            this.createRecordDetails()
            const popup = document.getElementById('successPopup');
            popup.style.display = 'block';

            // Hide the popup after 3 seconds
            setTimeout(() => {
                popup.style.display = 'none';
            }, 3000);


            
        } catch (error) {
            console.error("Error fetching products:", error);
        }


    }

    setmessage=()=> {
        setTimeout(()=>{
            console.log("-----------------------srt timeout")
            this.state.message=0
        },5000)
      }

    
}
NewBinManagement.template = "NewBinManagement";
registry.category("actions").add("owl.new_bin_management", NewBinManagement);




// const form = document.getElementById("dropdownForm");

// form.addEventListener("submit", function (e) {
//   e.preventDefault(); // Prevent form submission

//   // Select all inputs and their associated error messages
//   const inputContainers = document.querySelectorAll(".input-container");

//   let isValid = true;

//   inputContainers.forEach((container) => {
//     const select = container.querySelector("select");
//     const errorMessage = container.querySelector(".error-message");

//     // Validation logic
//     if (select.value === "") {
//       errorMessage.textContent = `Please select a ${select.name}.`;
//       errorMessage.style.display = "block";
//       isValid = false;
//     } else {
//       errorMessage.textContent = "";
//       errorMessage.style.display = "none";
//     }
//   });

//   if (isValid) {
//     alert("Form submitted successfully!");
//     form.reset(); // Optional: Reset the form
//   }
// });


/* @odoo-module */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("dropdownForm");
  
    if (form) {
      // Handle form submission
      form.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent form submission
  
        const inputContainers = document.querySelectorAll(".input-container");
        let isValid = true;
  
        inputContainers.forEach((container) => {
          const select = container.querySelector("select");
          const errorMessage = container.querySelector(".error-message");
  
          // Validate dropdowns
          if (select && (select.value === "" || select.value === "select")) {
            errorMessage.textContent = `Please select a valid ${select.name || "option"}.`;
            errorMessage.style.display = "block";
            isValid = false;
          } else if (errorMessage) {
            errorMessage.textContent = "";
            errorMessage.style.display = "none";
          }
        });
  
        // Validate rows and columns input fields
        const rowInput = form.querySelector(".row-input");
        const columnInput = form.querySelector(".column-input");
  
        if (rowInput && !rowInput.value.trim()) {
          alert("Row value cannot be empty!");
          isValid = false;
        }
  
        if (columnInput && !columnInput.value.trim()) {
          alert("Column value cannot be empty!");
          isValid = false;
        }
  
        if (isValid) {
          alert("Form submitted successfully!");
          form.reset(); // Reset the form (optional)
        }
      });
  
      // Handle dynamic error clearing for dropdowns
      const selects = form.querySelectorAll("select");
      selects.forEach((select) => {
        select.addEventListener("change", function () {
          const container = this.closest(".input-container");
          const errorMessage = container.querySelector(".error-message");
  
          if (this.value !== "" && this.value !== "select") {
            errorMessage.textContent = "";
            errorMessage.style.display = "none";
          }
        });
      });
    }
  });
  