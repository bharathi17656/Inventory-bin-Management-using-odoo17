from odoo import models,api,fields



class stock_warehouse(models.Model):
    _inherit = 'stock.warehouse'

    parent_warehouse = fields.Many2one(
        'stock.warehouse',   # Reference to the same model
        string="Parent Warehouse", 
        help="Select the parent warehouse from existing warehouses"
    )


    def get_existing_warehouse(self,parent='null'):

        print("==============================inside",parent)
        if parent == None :
            query = f"""
                SELECT
                    id as id,
                    name as name,
                    code as shortname,
                    view_location_id as location_id
                FROM
                    stock_warehouse
                WHERE 
                    parent_warehouse is null

                    
                """
            print("run query ----------------",query)
            
        elif parent != 'null':
             
             query = f"""
                SELECT
                    id as id,
                    name as name,
                    code as shortname,
                    view_location_id as location_id
                FROM
                    stock_warehouse
                WHERE 
                    parent_warehouse = {parent}

                    
                """
             print("run query ----------------",query)
        else:


            query = """
                SELECT
                    id as id,
                    name as name,
                    code as shortname,
                    view_location_id as location_id
                FROM
                    stock_warehouse

                    
            """
        self.env.cr.execute(query)
        return self.env.cr.dictfetchall()
    

   

             

    def get_stock_lot_record_id(self,data):

        query=f"""
            SELECT lot_stock_id as id 
            FROM stock_warehouse
            where id = {data}
                
            """

        self.env.cr.execute(query)
       
        print('last ended ')
        return self.env.cr.dictfetchall()
       
        
    













