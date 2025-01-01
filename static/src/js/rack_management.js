/* @odoo-module */
import { Component, useState, useEffect, useRef,onWillStart } from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";


export class RackManagement extends Component {
    setup() {
        this.state = useState({
            warehouse_list:[],
            child_list:[],
            parent:0,
            child:0,
            rack_name:null,
            message:0,
            error_warehouse:"",
            error_rackname:"",
            error_submit:null,
            error_clear:null
           
        });


        console.log('-----------------------------my state in rack',this.state)

        onWillStart(async () => {
            await this.getWarehouselist();
        
    })

    this.onWarehouseChange = this.onWarehouseChange.bind(this);
    this.onWarehouseChildChange = this.onWarehouseChildChange.bind(this);

        

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
    

    onWarehouseChange = (event)=> {
            if (event && event.target) {
                const selectedParent1 = event.target.value;

                console.log("selected parent",selectedParent1)
                if(selectedParent1 != 'select'){
    
                    if ( selectedParent1 == 'parentnull'){
    
                        this.state.parent = null
                        this.state.child_list = this.state.warehouse_list

                        console.log("selected state after parent",this.state)


                }
                else{
                    const selectedParent = parseInt(selectedParent1, 10);
                this.state.parent = selectedParent
                console.log("current with parent name ",this.state.parent)
                this.getChildWarehouselist(selectedParent)
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


    cleardata = () =>{
        this.state.warehouse_list = []; // Set to empty array to reset

        // Reset other state properties as needed
        this.state.parent = 0;
        this.state.child = '';
        this.state.rack_name = '';
    
        // Optionally, reset child_list as well if you don't need it anymore
        this.state.child_list = [];

        this.state.error_clear ="yes"
        setTimeout(() => {
            this.state.error_clear=null


        }, 5000);
    
        // Re-fetch warehouse data to make sure you have the options available after clearing
         this.getWarehouselist(); // Assuming this function will refetch and populate warehouse list
    
        console.log("After clearing, state is:", this.state);

    
    }  
    
    async createrack(){
            try {
                console.log("its in create")

                if (this.state.parent != null ){
                    console.log("its in warehouse")
                    console.log("its in warehouse",this.state)
                    if (this.state.child > 0){
                       if( this.state.rack_name != null){

                        console.log("its in 3thd")


                             const categoryName = this.state.rack_name.trim(); // Get and trim the input value

                
                            // Call Odoo backend to search for the category name in the model
                            const result1 = await jsonrpc('/web/dataset/call_kw', {
                                model: 'stock.storage.category', // The model you're searching in
                                method: 'search_count', // Search method to count matching records
                                args: [[['name', 'ilike', categoryName]]], // Domain to filter categories by name
                                kwargs: {},
                            });
                            console.log("-------------------------after dublicate",result1,categoryName)
                            if (result1){
                             
                                this.state.error_rackname="This Rack Name is already Available "
                                setTimeout(() => {
                                    this.state.error_rackname=null
        
        
                                }, 5000);
                            }
                            else{


                                const data={
                                    parent:this.state.parent,
                                    child:this.state.child,
                                    name:this.state.rack_name
                                }

                                console.log("---------------------------state values",this.state)
                                const result = await jsonrpc('/web/dataset/call_kw', {
                                model: 'stock.storage.category',
                                method: 'create_new_storage_category',
                                args: [],  // Add an empty array as `args` to avoid the IndexError
                                kwargs: {
                                    data:data
                                },
                            });
    
                            console.log('---------------------created rack',result)

                            this.state.error_submit="yes"
                            setTimeout(() => {
                                this.state.error_submit=null
    
    
                            }, 5000);

                            }

                           
                            


                          
                    
                      
                       }
                       else{
                         this.state.error_rackname="Please Enter valid Rack Name Ex-'Rack-15' "
                           // Hide the popup after 3 seconds
                        setTimeout(() => {
                            this.state.error_rackname=null


                        }, 5000);
                       }
                    }
                    else{
                        this.state.error_warehouse="Please Select valid Warehouse"
                         this.state.error_rackname="Please Enter valid Rack Name Ex-'Rack-15' "
                        console.log("this error messga e",this.state)
                          // Hide the popup after 3 seconds
                          setTimeout(() => {
                           
                            this.state.error_warehouse=null
                            this.state.error_rackname=null

                        }, 5000);
                        
                    }



                }
                else{
                    this.state.error_warehouse="Please Select valid Warehouse"


                    console.log("this error messga e",this.state)
                      // Hide the popup after 3 seconds
                      setTimeout(() => {
                       
                        this.state.error_warehouse=null

                    }, 5000);
                    
                }
                
                

                
            


        } catch (error) {
            console.error("Error in rack creation :", error);
        }
    }
    // setmessage=()=> {
    //     setTimeout(()=>{
    //         console.log("-----------------------srt timeout")
    //         this.state.message=0
    //     },5000)
    //   }

  
}
RackManagement.template = "RackManagement";
registry.category("actions").add("owl.new_rack_management", RackManagement);
