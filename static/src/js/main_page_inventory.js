
/** @odoo-module **/
import { Component, useState, mount,useEffect, useRef,onWillStart,xml,onMounted } from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";

export class MainPageInventory extends Component{

    
    setup(){
       this.state=useState({
        inwardtable:[],
        outwardtable:[],
        agedlist:[],
        purchaselist:[],
        deliverylist:[],
        countedpurchase:[],
        counteddelivery:[],
        selectCountPurchase:'7',
        selectCountDelivery:'7',
        selectdeliverygraph:'7',
        selectpurchasegraph:'7',
        selectagedlist:7,
        purchasecount:{
            length:0,
            total_qty:0,
            best_one:'',
            best_one_qty:0
        },
        deliverycount:{
            length:0,
            total_qty:0,
            best_one:'',
            best_one_qty:0
        }
       })

       onWillStart(async()=>{
        await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js");
        this.onchangingAgedProduct('All');
        this.onchangingDelivery('All');
        this.onchangingPurchase('All');
        this.onchangecounterpurchase('All');
        this.onchangecounterdelivery('All');
        this.get_purchase_filtered_history();
        this.get_delivery_filtered_history();
  
       })


       this.chartReftopdelivery = useRef("topdelivery");
       this.chartReftopaged = useRef("topaged");
       this.chartReftoppurchase = useRef("toppurchase");
 

       onMounted(async () => {
          this.topdeliveryproducts();
          this.toppurchaseproducts();
     

       })



       const today = new Date().toISOString().split("T")[0];
       const currentYearStart = new Date().getFullYear();// January 1st of the current year

       this.state.from_date = `${currentYearStart}-01-01 00:00:00`;
       this.state.to_date = `${today} 23:59:59`;

       
    }



    


    onchangecounterpurchase=async(e)=>{
        if (e == 'All'){

            try{
                const purchaselist = await jsonrpc('/web/dataset/call_kw', {
                    model: 'stock.move',
                    method: 'get_purchase_count_by_product',
                    args: [[],this.state.selectCountPurchase], // Pass the product ID as an argument
                    kwargs: {},
                });
    
                this.state.countedpurchase  = purchaselist

                this.state.purchasecount.length =purchaselist.length
                let total_qty=0
                
                purchaselist.map(data=>{
                    total_qty +=data.total_qty_in
                })
                this.state.purchasecount.total_qty = total_qty

                if (purchaselist.length > 0) {
                    const proname = purchaselist[0].product_name;
                    const proqty = purchaselist[0].total_qty_in;
                
                    this.state.purchasecount.best_one = proname['en_US']
                    this.state.purchasecount.best_one_qty=proqty || 0;
                } else {
                    this.state.purchasecount.best_one = 'No Data Available';
                }

                console.log("this.state is my top dashboard"), this.state
                
    
            }
            catch{
                console.log("-------------------not working for counter top purchase in try ")
            }

        }
        else if (e && e.target){

            const period =e.target.value;
            if(period != this.state.selectCountPurchase){

                this.state.selectCountPurchase=period

                try{
                    const purchaselist = await jsonrpc('/web/dataset/call_kw', {
                        model: 'stock.move',
                        method: 'get_purchase_count_by_product',
                        args: [[],period], // Pass the product ID as an argument
                        kwargs: {},
                    });
        
                    this.state.countedpurchase  = purchaselist

                    this.state.purchasecount.length =purchaselist.length
                    let total_qty=0
                
                    purchaselist.map(data=>{
                        total_qty +=data.total_qty_in
                    })
                    this.state.purchasecount.total_qty = total_qty

                    if (purchaselist.length > 0) {
                        const proname = purchaselist[0].product_name;
                        const proqty = purchaselist[0].total_qty_in;
                    
                        this.state.purchasecount.best_one = proname['en_US']
                        this.state.purchasecount.best_one_qty=proqty || 0;
                    } else {
                        this.state.purchasecount.best_one = 'No Data Available';
                    }

                    console.log("this.state is my top dashboard"), this.state
                        
                   
        
                }
                catch{
                    console.log("-------------------not working aged in try ")
                }

                
            }


        }

        
    }


    get_purchase_filtered_history = async ()=>{
		const filter_data = {
			start_date:this.state.from_date,
			end_date:this.state.to_date,
			
		}


		console.log("this is send the para for delivery  filter ",filter_data)
		try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.quant',
                method: 'get_product_purchase_move_history',
                args: [[],filter_data],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                  
                },
            });

            let i=0;
            let tablerowdata=[]
            for (i = 0; i<=4;i++){
                tablerowdata.push(result[i])

            }
			

			this.state.inwardtable = [...tablerowdata]; // Use spread operator to ensure reactivity

			


			console.log('my fetched purchase result', this.state.inwardtable)

		}
		catch {
			alert('error got from purchase filter ')
		}

	}


    get_delivery_filtered_history = async ()=>{
		const filter_data = {
			start_date:this.state.from_date,
			end_date:this.state.to_date,
			
		}


		console.log("this is send the para for delivery  filter ",filter_data)
		try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.quant',
                method: 'get_product_delivery_move_history',
                args: [[],filter_data],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                  
                },
            });

            let i=0;
            let tablerowdata=[]
            for (i = 0; i<=4;i++){
                tablerowdata.push(result[i])

            }
			

			this.state.outwardtable = [...tablerowdata]; // Use spread operator to ensure reactivity

			


			console.log('my fetched purchase result', this.state.outwardtable)

		}
		catch {
			alert('error got from delivery filter ')
		}

	}


    onchangecounterdelivery=async(e)=>{
        if (e == 'All'){

            try{
                const deliverylist = await jsonrpc('/web/dataset/call_kw', {
                    model: 'stock.move',
                    method: 'get_delivery_count_by_product',
                    args: [[],this.state.selectCountDelivery], // Pass the product ID as an argument
                    kwargs: {},
                });
    
                this.state.counteddelivery  = deliverylist

                this.state.deliverycount.length =deliverylist.length
                let total_qty=0
                
                deliverylist.map(data=>{
                    total_qty +=data.total_qty_out
                })
                this.state.deliverycount.total_qty = total_qty

                if (deliverylist.length > 0) {
                    const proname = deliverylist[0].product_name;
                    const proqty = deliverylist[0].total_qty_out;
                
                    this.state.deliverycount.best_one =proname['en_US']
                    this.state.deliverycount.best_one_qty =proqty || 0
                } else {
                    this.state.deliverycount.best_one = 'No Data Available';
                }

                console.log("this.state is my top dashboard",this.state)
                
    
            }
            catch{
                console.log("-------------------not working for counter top purchase in try ")
            }

        }
        else if (e && e.target){

            const period =e.target.value;
            if(period != this.state.selectCountDelivery){
                this.state.selectCountDelivery=period

                try{
                    const deliverylist = await jsonrpc('/web/dataset/call_kw', {
                        model: 'stock.move',
                        method: 'get_delivery_count_by_product',
                        args: [[],period], // Pass the product ID as an argument
                        kwargs: {},
                    });
        
                    this.state.counteddelivery  = deliverylist

                    this.state.deliverycount.length =deliverylist.length
                    let total_qty=0
                
                    deliverylist.map(data=>{
                        total_qty +=data.total_qty_out
                    })
                    this.state.deliverycount.total_qty = total_qty

                    if (deliverylist.length > 0) {
                        const proname = deliverylist[0].product_name;
                        const proqty = deliverylist[0].total_qty_out;
                    
                        this.state.deliverycount.best_one =proname['en_US']
                        this.state.deliverycount.best_one_qty =proqty || 0
                    } else {
                        this.state.deliverycount.best_one = 'No Data Available';
                    }

                    console.log("this.state is my top dashboard",this.state)
                        
                   
        
                }
                catch{
                    console.log("-------------------not working aged in try ")
                }

                
            }


        }


        


        
    }



    




    

    topdeliveryproducts() {
        if (this.state) {
            console.log('Rendering the top delivery products chart...');
    
            // Destroy the old chart instance if it exists
            if (this.topdelivery) {
                this.topdelivery.destroy();
            }
    
            if (this.chartReftopdelivery && this.chartReftopdelivery.el) {
                // Sample data extracted from delivery products

             let deliveryProducts = this.state.deliverylist

                let demoproduct ={product_name:"product", total_qty_out:0}
                if (deliveryProducts.length <5){
                    const listlength=deliveryProducts.length

                    let demolist=5-listlength
                    let i;
                    for(i=1;i<=demolist;i++){
                       deliveryProducts.push(demoproduct)
                    }
                }
                console.log("this is smy product with demo for my data ",deliveryProducts)
                // Map data for labels and total quantities
                const labels = deliveryProducts.map(product => product.product_name.en_US).slice(0,5);
                const totalQuantities = deliveryProducts.map(product => product.total_qty_out).slice(0,5);
                const backgroundColors = ['#2c728e', '#21908c', '#27ad81', '#5dc863', '#aadc32'];
    
                // Initialize the new chart instance
                this.topdelivery = new Chart(this.chartReftopdelivery.el, {
                    type: 'bar', // Horizontal bar chart
                    data: {
                        labels: labels, // Product names
                        datasets: [
                            {
                                label: 'Total Qty',
                                data: totalQuantities, // Corresponding total quantities
                                backgroundColor: backgroundColors.slice(0, labels.length),
                                borderColor: backgroundColors.slice(0, labels.length),
                                borderWidth: 1
                            },
                        ]
                    },
                    options: {
                        // indexAxis: 'y', // Makes it a horizontal bar chart
                        scales: {
                            x: {
                                beginAtZero: true, // X-axis should start from zero
                                title: {
                                    display: true, // Show title on X-axis
                                    text: 'Products', // Custom X-axis label
                                    color: 'black',
                                    font: {
                                        size: 12 // Font size for the X-axis label
                                    },
                                },
                                // ticks: {
                                //     stepSize: 100 // Step size for X-axis ticks
                                // },
                                grid: {
                                    display: false, // Remove vertical grid lines
                                    drawBorder: false // Remove chart border on x-axis
                                },
                                ticks: {
                                    font: {
                                        family: 'Arial', // Set font style to Arial
                                        size: 12
                                    }
                                },
                                barThickness: 10 // Set fixed bar width
                            },
                            y: {
                                title: {
                                    display: true, // Show title for Y-axis
                                    text: 'Qty', // Label for Y-axis
                                    color: 'black',
                                    font: {
                                        size: 12 // Font size for the Y-axis label
                                    },
                                },
                                grid: {
                                    display: false, // Remove horizontal grid lines
                                    drawBorder: false // Remove chart border on y-axis
                                },
                                ticks: {
                                    font: {
                                        family: 'Arial', // Set font style to Arial
                                        size: 12
                                    }
                                }
                            }
                        },
                        
                        responsive: true, // Make chart responsive
                        maintainAspectRatio: false,
                        plugins: {
                            
                            legend: {

                                display:true,
                                position: 'bottom', // Legend at the top
                                labels: {
                                    generateLabels: function(chart) {
                                        return labels.map((label, index) => ({
                                            text: `${label} (${totalQuantities[index]} Units)`,
                                            fillStyle: backgroundColors[index % backgroundColors.length]
                                        }));
                                    },
                                    boxWidth: 20, // Adjust box size if needed
                                    padding: 15, // Add padding between legend items
                                    
                                    font: {
                                        family: 'Arial', // Set font style to Arial
                                        size: 12
                                    }
                                },
                                maxWidth: 2, // Maximum number of items per row
                                onClick: null, // Disable default legend click behavior
                            },
                            title: {
                                display: false, // Display title
                                text: 'Top 5 Delivery Products and Their Quantities' // Chart title
                            }
                        }
                    }
                });
            } else {
                console.log('Chart reference for Top Delivery Products is invalid.');
            }
        } else {
            console.log('No data available for rendering top delivery products chart.');
        }
    }
    




    toppurchaseproducts() {
        if (this.state) {
            console.log('Rendering the top Inward products chart...');
    
            // Destroy the old chart instance if it exists
            if (this.toppurchase) {
                this.toppurchase.destroy();
            }
    
            if (this.chartReftoppurchase && this.chartReftoppurchase.el) {
                // Sample data extracted from delivery products
                let deliveryProducts = this.state.purchaselist


               
                let demoproduct ={product_name:"product", total_qty_in:0}
                if (deliveryProducts.length <5){
                    const listlength=deliveryProducts.length

                    let demolist=5-listlength
                    let i;
                    for(i=1;i<=demolist;i++){
                       deliveryProducts.push(demoproduct)
                    }
                }
    
                // Map data for labels and total quantities
                const labels = deliveryProducts.map(product => product.product_name.en_US).slice(0,5);
                const totalQuantities = deliveryProducts.map(product => product.total_qty_in).slice(0,5);
                const backgroundColors = ['#b77ef3', '#235fe3', '#ef8c3a', '#20bc5b', '#f7f700'];
    
                // Initialize the new chart instance
                this.toppurchase = new Chart(this.chartReftoppurchase.el, {
                    type: 'bar', // Horizontal bar chart
                    data: {
                        labels: labels, // Product names
                        datasets: [
                            {
                                label: 'Total Qty',
                                data: totalQuantities, // Corresponding total quantities
                                backgroundColor: backgroundColors.slice(0, labels.length),
                                borderColor: backgroundColors.slice(0, labels.length),
                                borderWidth: 1
                            },
                        ]
                    },
                    options: {
                        // indexAxis: 'y', // Makes it a horizontal bar chart
                        scales: {
                            x: {
                                beginAtZero: true, // X-axis should start from zero
                                title: {
                                    display: true, // Show title on X-axis
                                    text: 'Products', // Custom X-axis label
                                    color: 'black',
                                    font: {
                                        size: 12 // Font size for the X-axis label
                                    },
                                },
                                // ticks: {
                                //     stepSize: 100 // Step size for X-axis ticks
                                // },
                                grid: {
                                    display: false, // Remove vertical grid lines
                                    drawBorder: false // Remove chart border on x-axis
                                },
                                ticks: {
                                    font: {
                                        family: 'Arial', // Set font style to Arial
                                        size: 12
                                    }
                                },
                                barThickness: 10 // Set fixed bar width
                            },
                            y: {
                                title: {
                                    display: true, // Show title for Y-axis
                                    text: 'Qty', // Label for Y-axis
                                    color: 'black',
                                    font: {
                                        size: 12 // Font size for the Y-axis label
                                    },
                                },
                                grid: {
                                    display: false, // Remove horizontal grid lines
                                    drawBorder: false // Remove chart border on y-axis
                                },
                                ticks: {
                                    font: {
                                        family: 'Arial', // Set font style to Arial
                                        size: 12
                                    }
                                }
                            }
                        },
                        
                        responsive: true, // Make chart responsive
                        plugins: {
                            legend: {
                                position: 'bottom', // Legend at the top
                                display:true,
                                labels: {
                                    generateLabels: function(chart) {
                                        return labels.map((label, index) => ({
                                            text: `${label} (${totalQuantities[index]} Units)`,
                                            fillStyle: backgroundColors[index % backgroundColors.length]
                                        }));
                                    }
                                }
                            },
                            title: {
                                display: false, // Display title
                                text: 'Top 5 Inward Products and Their Quantities' // Chart title
                            }
                        }
                    }
                });
            } else {
                console.log('Chart reference for Top Inward Products is invalid.');
            }
        } else {
            console.log('No data available for rendering top Inward products chart.');
        }
    }
    







    
    






    // topdeliverymark() {
    //     if (this.state) {
    //         console.log('Rendering the top delivery products chart...');
    
    //         // Destroy the old chart instance if it exists
    //         if (this.topdelivery) {
    //             this.topdelivery.destroy();
    //         }
    
    //         if (this.chartReftopdelivery && this.chartReftopdelivery.el) {
    //             // Sample data for top 5 performers and their marks
    //             const labels = ['John', 'Emma', 'Noah', 'Olivia', 'Sophia'];
    //             const totalMarks = [95, 89, 87, 85, 83];
    //             const backgroundColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
    
    //             // Initialize the new chart instance
    //             this.topdelivery = new Chart(this.chartReftopdelivery.el, {
    //                 type: 'bar', // Horizontal bar chart
    //                 data: {
    //                     labels: labels, // Top 5 performers
    //                     datasets: [
    //                         {
    //                             label: 'Total Marks',
    //                             data: totalMarks, // Corresponding marks
    //                             backgroundColor: backgroundColors,
    //                             borderColor: backgroundColors,
    //                             borderWidth: 1
    //                         },
    //                     ]
    //                 },
    //                 options: {
    //                     indexAxis: 'y', // Makes it a horizontal bar chart
    //                     scales: {
    //                         x: {
    //                             beginAtZero: true, // X-axis should start from zero
    //                             title: {
    //                                 display: true, // Show title on X-axis
    //                                 text: 'Total Marks', // Custom X-axis label
    //                                 color: 'black',
    //                                 font: {
    //                                     size: 12 // Font size for the X-axis label
    //                                 },
    //                             },
    //                             ticks: {
    //                                 stepSize: 10 // Step size for X-axis ticks
    //                             }
    //                         },
    //                         y: {
    //                             title: {
    //                                 display: true, // Show title for Y-axis
    //                                 text: 'Performers', // Label for Y-axis
    //                                 color: 'black',
    //                                 font: {
    //                                     size: 12 // Font size for the Y-axis label
    //                                 },
    //                             },
    //                         }
    //                     },
    //                     responsive: true, // Make chart responsive
    //                     plugins: {
    //                         legend: {
    //                             position: 'top', // Legend at the top
    //                             labels: {
    //                                 generateLabels: function(chart) {
    //                                     return labels.map((label, index) => ({
    //                                         text: `${label} (${totalMarks[index]} qty)`,
    //                                         fillStyle: backgroundColors[index]
    //                                     }));
    //                                 }
    //                             }
    //                         },
    //                         title: {
    //                             display: true, // Display title
    //                             text: 'Top 5 Performers and Their Marks' // Chart title
    //                         }
    //                     }
    //                 }
    //             });
    //         } else {
    //             console.log('Chart reference for Top Delivery Products is invalid.');
    //         }
    //     } else {
    //         console.log('No data available for rendering top delivery products chart.');
    //     }
    // }
    


    // async topdeliveryptoducts() {
    //         if (this.state) {

    //             console.log('render for upcoming we are in the state');
    
    //             if (this.topdelivery) {
    //                 this.topdelivery.destroy();  // Destroy the old chart instance
    //             }
               
    //             if (this.chartReftopdelivery && this.chartReftopdelivery.el) {
                    
                    
    
    //                 this.topdelivery = new Chart(this.chartReftopdelivery.el, {
    //                     type: 'doughnut',  // Define chart type
    //                     data: {
    //                         // labels:['hathir','jin','backgrou'],  // Updated labels (DD/MM or original based on length)
    //                         datasets: [
    //                             {
    //                                 label: 'Completed Tasks',
    //                                 data: [1],  // Aggregated upcoming tasks data array
    //                                 backgroundColor: '#2DEF3A',
    //                                 borderColor:'rgb(75, 192, 192)',
    //                                 borderWidth: 1
                                      
    //                             },
    //                             {
    //                                 label: 'My Tasks',
    //                                 data: [6],  // Aggregated upcoming tasks data array
    //                                 backgroundColor: '#2DEF3A',
    //                                 borderColor:'rgb(75, 192, 192)',
    //                                 borderWidth: 1
                                      
    //                             },
    //                             {
    //                                 label: 'His Tasks',
    //                                 data: [5],  // Aggregated upcoming tasks data array
    //                                 backgroundColor: '#2DEF3A',
    //                                 borderColor:'rgb(75, 192, 192)',
    //                                 borderWidth: 1
                                      
    //                             },
    //                             {
    //                                 label: 'Hir Tasks',
    //                                 data: [7],  // Aggregated upcoming tasks data array
    //                                 backgroundColor: '#2DEF3A',
    //                                 borderColor:'rgb(75, 192, 192)',
    //                                 borderWidth: 1
                                      
    //                             },
    //                             {
    //                                 label: 'them Tasks',
    //                                 data: [9],  // Aggregated upcoming tasks data array
    //                                 backgroundColor: '#2DEF3A',
    //                                 borderColor:'rgb(75, 192, 192)',
    //                                 borderWidth: 1
                                      
    //                             },
    //                         ]
    //                     },
    //                     options: {
    //                         scales: {
    //                             x: {
    //                                 beginAtZero: true,  // X-axis should start from zero
    //                                 title: {
    //                                     display: true,  // Show title on X-axis
    //                                     text: 'Date',  // Custom X-axis label
    //                                     color: 'black',
    //                                     font: {
    //                                         size: 12,  // Increase font size for ticks
                                    
    //                                     },
    //                                 }
    //                             },
    //                             y: {
    //                                 beginAtZero: true,  // Start Y-axis from zero
    //                                 ticks: {
    //                                     stepSize: 10,  // Custom step size for Y-axis, fixed at 10
    //                                     callback: function(value) {
                                          
    //                                     }
    //                                 },
                                   
    //                                 title: {
    //                                     display: true,  // Show title for Y-axis
    //                                     text: 'Tasks',  // Label for Y-axis
    //                                     color: 'black',
    //                                     font: {
    //                                         size: 12,  // Font size for the Y-axis label
    //                                     },
    //                                 },
    //                             }
                                
    //                         },
    //                         responsive: true,  // Make chart responsive
    //                         plugins: {
    //                             legend: {
    //                                 position: 'top',  // Legend at the top
    //                             },
    //                             title: {
    //                                 display: true,  // Display title
                                   
    //                             }
    //                         }
    //                     }
    //                 });
    //             } else {
    //                 console.log('Chart reference for Upcoming Tasks is invalid.');
    //             }
    //         } else {
    //             console.log('No data available for rendering upcoming tasks chart');
    //         }
        
    //     }


    onclickSearchProduct=()=> {
        if (this.props.updateDashboard) {
            this.props.updateDashboard("searchpro"); // Call parent's updateDashboard method with 'searchPro'
        }
    }

    onclickview=(data)=>{
        if (this.props.updateDashboard) {
            this.props.updateDashboard(data); // Call parent's updateDashboard method with 'searchPro'
        }
        
    }


    async callActionResUsers() {
        try {
            await this.actionService.doAction("action_res_users"); // Action XML ID
            console.log("Action 'action_res_users' executed successfully!");
        } catch (error) {
            console.error("Error executing the action:", error);
        }
    }



    onchangingAgedProduct = async(e) =>{

        if(e === 'All'){

            try{
                const agedlist = await jsonrpc('/web/dataset/call_kw', {
                    model: 'stock.move',
                    method: 'get_aged_products',
                    args: [[],this.state.selectagedlist], // Pass the product ID as an argument
                    kwargs: {},
                });
    
                this.state.agedlist  = agedlist
    
                console.log("------------------its working aged in try  ", this.state.agedlist)
    
            }
            catch{
                console.log("-------------------not working aged in try ")
            }

        }


        else if(e && e.target ){
            const period=parseInt(e.target.value);

         if(period != this.state.selectagedlist){
            this.state.selectagedlist = period



            try{
                const agedlist = await jsonrpc('/web/dataset/call_kw', {
                    model: 'stock.move',
                    method: 'get_aged_products',
                    args: [[],period], // Pass the product ID as an argument
                    kwargs: {},
                });
    
                this.state.agedlist  = agedlist
    
                console.log("------------------its working aged in try  ", this.state.agedlist)
    
            }
            catch{
                console.log("-------------------not working aged in try ")
            }


         }
         else{
            console.log("this select period not changed ")
         }
            
        }
        
        

    }
    onchangingPurchase = async(e) =>{


        if(e === 'All'){
            try{
                const purchaselist = await jsonrpc('/web/dataset/call_kw', {
                    model: 'stock.move',
                    method: 'get_purchase_count_by_product',
                    args: [[],this.state.selectpurchasegraph], // Pass the product ID as an argument
                    kwargs: {},
                });
    
                this.state.purchaselist  = purchaselist
                console.log("------------------its working aged in try  ", this.state.purchaselist)
                this.toppurchaseproducts();
    
            }
            catch{
                console.log("-------------------not working aged in try ")
            }

        }
        else if(e && e.target){
            const period = e.target.value;

            if(period != this.state.selectpurchasegraph){

                this.state.selectpurchasegraph = period


                try{
                    const purchaselist = await jsonrpc('/web/dataset/call_kw', {
                        model: 'stock.move',
                        method: 'get_purchase_count_by_product',
                        args: [[],period], // Pass the product ID as an argument
                        kwargs: {},
                    });
        
                    this.state.purchaselist  = purchaselist
                    console.log("------------------its working aged in try  ", this.state.purchaselist)
                    this.toppurchaseproducts();
        
                }
                catch{
                    console.log("-------------------not working purchase in try ")
                }
            }

            else{
            console.log("period not changed ")
            }
           
        }

       

    }
    onchangingDelivery= async(e) =>{

        if(e === 'All'){

            try{
                const deliverylist = await jsonrpc('/web/dataset/call_kw', {
                    model: 'stock.move',
                    method: 'get_delivery_count_by_product',
                    args: [[],this.state.selectdeliverygraph], // Pass the product ID as an argument
                    kwargs: {},
                });
    
                this.state.deliverylist  = deliverylist
                console.log("------------------its working aged in try  ", this.state.deliverylist)
    
    
                this.topdeliveryproducts();
    
            }
            catch{
                console.log("-------------------not working delivery in try ")
            }

        }
        else if(e && e.target){
            const period = e.target.value;

            if(period != this.state.selectdeliverygraph){

                this.state.selectdeliverygraph = period


                try{
                    const deliverylist = await jsonrpc('/web/dataset/call_kw', {
                        model: 'stock.move',
                        method: 'get_delivery_count_by_product',
                        args: [[],period], // Pass the product ID as an argument
                        kwargs: {},
                    });
        
                    this.state.deliverylist  = deliverylist
                    console.log("------------------its working delivery in try  ", this.state.deliverylist)
        
        
                    this.topdeliveryproducts();
        
                }
                catch{
                    console.log("-------------------not working my aged in try ")
                }

            }
            else{
                console.log("period not changed ")
                }
        }

        

    }



    

  



}
// MainPageInventory.template =xml` <div >
//                                 <div  class="twogrid">
//                                          <div class="rightdiv">
//                                     </div>
//                                         <div class="leftdiv">
//                                             <div>
//                                                 <h1 class="h1types">
//                                                     Inventory 
//                                                     Management Solutions
//                                                 </h1>

//                                                 <div class="quotes">
//                                                 "Inventory is the bridge between supply and demand, and managing it well is the art of building that bridge strong enough to support growth, yet flexible enough to adapt to change."
//                                                 </div>
                                                
//                                                 <button class="buttons-home-page" t-on-click="onclickSearchProduct" > Products </button>
//                                             </div>
//                                         </div>
//                                         </div>
                                   
//                                 </div>
                                
                                    
MainPageInventory.template ='mainpageinventory'