from odoo import models,api,fields




class storage_category(models.Model):
    _inherit = 'stock.storage.category'

    name = fields.Char(string='Rack Name', required=True)


    parent_warehouse = fields.Many2one(
        'stock.warehouse',   # Reference to the same model
        string="Warehouse", 
        help="Select the parent warehouse from existing warehouses"
    )

    child_warehouse = fields.Many2one(
        'stock.warehouse',   # Reference to the same model
        string="Child Warehouse",  
        help="Select the Child warehouse from the selected Parent warehouse",
        domain="[('parent_warehouse', '=', parent_warehouse)]"
    )

    def get_rack_list(self,num):
        query = f"""
                SELECT
                    id as id,
                    name as name
                FROM
                    stock_storage_category
                WHERE 
                    child_warehouse = {num}

                    
                """
        print("run query ----------------",query)

        self.env.cr.execute(query)
        return self.env.cr.dictfetchall()





    @api.model
    def create_new_storage_category(self, data, max_weight=0.0, allow_new_product='mixed', company_id=None):
        """
        Creates a new storage category record based on the provided field values.
        :param name: Name of the storage category (required).
        :param max_weight: Maximum weight capacity for the category.
        :param allow_new_product: Selection criteria for product allowance.
        :param company_id: ID of the company to which this storage category belongs.
        :return: The newly created storage category record.

      
        """

        print("---------------------data",data)
        values = {
            'parent_warehouse':data['parent'],
            'child_warehouse':data['child'],
            'name': data['name'],
            'max_weight': max_weight,
            'allow_new_product': allow_new_product,
            'company_id': company_id,
        }
        
        # Create the new record
        new_category = self.create(values)
        return new_category
    

    # def get_existing_rack(self,parent='null'):

    #     print("==============================inside",parent)
    #     if parent != 'null':
             
    #          query = f"""
    #             SELECT
    #                 id as id,
    #                 name as name
    #             FROM
    #                 stock.storage.category
    #             WHERE 
    #                 child_warehouse = {parent}

                    
    #             """
    #          print("run query ----------------",query)

    #          self.env.cr.execute(query)
    #          return self.env.cr.dictfetchall()

