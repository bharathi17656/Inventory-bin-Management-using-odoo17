
from odoo import models, fields, api, _
from odoo.exceptions import UserError



class ResGroups(models.Model):
    _inherit ='res.groups'



    def getusergrouplist(self, user_id):
        try:
            user = self.env['res.users'].browse(user_id)  # Fetch the user record by ID
            if user.has_group('nakoa_access_rights.inventory_access_management_employee'):
                return 'emp'  # User belongs to the group
            if user.has_group('nakoa_access_rights.inventory_access_management_admin'):
                return 'admin'  # User belongs to the group
            if user.has_group('nakoa_access_rights.inventory_access_management_super_admin'):
                return 'sp'  # User belongs to the group
            return False  # User does not belong to the group
        except Exception as e:
            UserError(f"Error checking group: {e}")
            return False

class OurCustomer(models.Model):
    _name = 'our.customer'


    
    name = fields.Char(string='Customer Name', required=True)
    number = fields.Char(string='Customer Number', required=True)
    email=fields.Char(string="Customer Email")
    address=fields.Char(string="Customer Address" )
    city=fields.Char(string="City" )
    state=fields.Char(string="State" )
    pincode=fields.Char(string="Pincode" )
    

    _sql_constraints = [
        ('number_unique', 'unique(number)', 'The customer number must be unique.')
    ]



    def create_customer(self, vals):
        """
        Create a new customer.
        :param vals: Dictionary of values to create a customer record
        :return: Created customer record
        """
        if self.search([('number', '=', vals.get('number'))]):
            raise ValueError("Customer number already exists.")
        customer = self.create(vals)
        return customer

    def update_customer(self, customer_id, vals):
        """
        Update an existing customer.
        :param customer_id: ID of the customer to update
        :param vals: Dictionary of values to update the customer record
        :return: Updated customer record
        """
        customer = self.browse(customer_id)
        if customer.exists():
            customer.write(vals)
            return customer
        else:
            return False
        
    def delete_customer(self, customer_id):
        """
        Delete an existing customer.
        :param customer_id: ID of the customer to delete
        :return: True if the customer was deleted, False otherwise
        """
        customer = self.browse(customer_id)
        if customer.exists():
            customer.unlink()
            return True
        else:
            return False
        

    def get_customer_data(self,id):
        query =f"select name,number,email,address,city,state,pincode from our_customer where id={id}"
        self.env.cr.execute(query)
        result= self.env.cr.dictfetchall()

        print("----------------this is query for selected customer data ",query)
        print("========================================================================================",result)
        return result
        


    def getuserlist(self):
        query=""" 
                select 
                        ru.id,
                        rp.name,
                        ru.login
                        
                from res_users ru

                join res_partner rp on ru.partner_id=rp.id  """
        
        self.env.cr.execute(query)
        results = self.env.cr.dictfetchall()
        return results
    


    def getupdateuser(self,id):
        query=f""" 
                select 
                        ru.id,
                        rp.name,
                        ru.login
                        
                from res_users ru

                join res_partner rp on ru.partner_id=rp.id  
                
                where ru.id = {id}"""
        
        self.env.cr.execute(query)
        results = self.env.cr.dictfetchall()



        print("this is my user fetcehd data  from res users ", results)
        return results
    

class OurVendor(models.Model):
    _name = 'our.vendor'

    name = fields.Char(string='Vendor Name', required=True)
    number = fields.Char(string='Vendor Number', required=True)
    email=fields.Char(string="Vendor Email")
    address=fields.Char(string="Vendor Address" )
    cname=fields.Char(string="Contact Person name")
    city=fields.Char(string="City" )
    state=fields.Char(string="State" )
    pincode=fields.Char(string="Pincode" )
    
    _sql_constraints = [
        ('number_unique', 'unique(number)', 'The customer number must be unique.')
    ]


    def create_vendor(self, vals):
        """
        Create a new vendor.
        :param vals: Dictionary of values to create a vendor record
        :return: Created vendor record
        """
        if self.search([('number', '=', vals.get('number'))]):
            raise ValueError("vendor number already exists.")
        vendor = self.create(vals)
        return vendor

    def update_vendor(self, vendor_id, vals):
        """
        Update an existing vendor.
        :param vendor_id: ID of the vendor to update
        :param vals: Dictionary of values to update the vendor record
        :return: Updated vendor record
        """
        vendor = self.browse(vendor_id)
        if vendor.exists():
            vendor.write(vals)
            return vendor
        else:
            return False
        
    def delete_vendor(self, vendor_id):
        """
        Delete an existing vendor.
        :param vendor_id: ID of the vendor to delete
        :return: True if the vendor was deleted, False otherwise
        """
        vendor = self.browse(vendor_id)
        if vendor.exists():
            vendor.unlink()
            return True
        else:
            return False

    def get_vendor_data(self,id):
        query =f"select name,number,email,address,cname,city,state,pincode from our_vendor where id={id}"
        self.env.cr.execute(query)
        result= self.env.cr.dictfetchall()

        print("----------------this is query for selected vendor data ",query)
        print("========================================================================================",result)
        return result



class ResPartner(models.Model):
    _inherit="res.partner"


    def getCustomer_id(self):
        query = " select id, name,number,city from our_customer"
        self.env.cr.execute(query)
        results = self.env.cr.dictfetchall()
        return results
    


    def getVendor_id(self):
        query = " select id, name,number,cname,city from our_vendor"
        self.env.cr.execute(query)
        results = self.env.cr.dictfetchall()
        return results


    def getpartner_id(self):
        query = " select id, name from res_partner"


        self.env.cr.execute(query)
        results = self.env.cr.dictfetchall()
        return results
    

    def getbin_location(self):
        query="""

                 SELECT 
                    sq.location_id, 
                    sl.name AS location_name
                FROM 
                    stock_quant sq
                JOIN 
                    product_product pp ON sq.product_id = pp.id
                JOIN 
                    product_template pt ON pp.product_tmpl_id = pt.id
                JOIN 
                    stock_location sl ON sq.location_id = sl.id
                JOIN 
                    stock_storage_category ssc ON sl.storage_category_id = ssc.id
                WHERE 
                    
                     sl.usage = 'internal' -- Only include internal storage locations
                   
                GROUP BY 
                    sq.location_id, sl.name
                ORDER BY 
                    sl.name
					


            """
           

        self.env.cr.execute(query)
        results = self.env.cr.dictfetchall()
        return results
    



    def update_user(self, user_id, vals):
        """
        Update the user and their associated partner record with the provided values.

        Args:
            user_id (int): The ID of the user to update.
            vals (dict): A dictionary containing v  alues to update. Expected keys are 'name' and 'email'.

        Returns:
            bool: True if the update was successful, False otherwise.
        """
        try:
            print('This is update user vals list:', user_id, vals)

            # Extracting data from the vals dictionary
            name = {'name': vals.get('name')}
            login = {'login': vals.get('email')}

            # Fetch the user record
            user = self.env['res.users'].browse(user_id)

            if not user.exists():
                print("User does not exist.")
                return False

            # Fetch the associated partner record (already a recordset)
            partner = user.partner_id

            if not partner.exists():
                print("Partner does not exist.")
                return False

            # Update the user and partner records
            user.write(login)
            partner.write(name)

            print("User and partner updated successfully.")
            return True

        except KeyError as e:
            print(f"Missing required field: {e}")
            return False
        except Exception as e:
            print(f"An error occurred: {e}")
            return False
        

        
    def updateproductpage(self,id,vals_list):
        try:
            product=self.env['product.template'].browse(id)
            if not product.exists():
                print("product does not exits in the model")
                return False
            product.write(vals_list)
            print("this is updated now you can see the new details ")
            return True
        except KeyError as e:
            print(f"Missing required field: {e}")
            return False
        except Exception as e:
            print(f"An error occurred: {e}")
            return False
    

    
class StockLocation(models.Model):
    _inherit ='stock.location'



    def getbin_location(self,product_id):


        query=f"""

                SELECT * FROM (
            -- Query 2
            SELECT 
                sq.location_id, 
                sl.name AS location_name
            FROM 
                stock_quant sq
            JOIN 
                product_product pp ON sq.product_id = pp.id
            JOIN 
                product_template pt ON pp.product_tmpl_id = pt.id
            JOIN 
                stock_location sl ON sq.location_id = sl.id
            JOIN 
                stock_storage_category ssc ON sl.storage_category_id = ssc.id
            WHERE 
                sq.quantity >= 0 -- Only include products with positive stock
                AND sl.usage = 'internal' -- Only include internal storage locations
                AND pp.id = {product_id}
            GROUP BY 
                sq.location_id, sl.name
            ORDER BY 
                sl.name
        ) AS q2

        UNION

        SELECT * FROM (
            -- Query 1
            SELECT 
                id AS location_id, 
                name AS location_name
            FROM 
                stock_location
            WHERE 
                product_id = {product_id}
            ORDER BY 
                id
        ) AS q1

        UNION

        SELECT * FROM (
            -- Query 3
            SELECT 
                id AS location_id, 
                name AS location_name
            FROM 
                stock_location
            WHERE 
                product_id IS NULL 
                AND storage_category_id IS NOT NULL
            ORDER BY 
                id
            LIMIT 3
        ) AS q3;




        """
        print("this is getbin location query",query)
        self.env.cr.execute(query)
        results = self.env.cr.dictfetchall()
        return results
    


    def get_existing_productlist(self):
        query = """
            select pp.id , pt.name
            from product_product pp
            join product_template pt on pp.product_tmpl_id = pt.id

                            
            """
        self.env.cr.execute(query)
        product_list =  self.env.cr.dictfetchall()
        data=[]
        for i in product_list:
            data.append({'id':i['id'],'name':i['name']['en_US']})

        return data






class StockPicking(models.Model):
    _inherit = 'stock.picking'

    def set_state_done(self,id):
       print(id)
       self.env.cr.execute("""
            UPDATE stock_picking
            SET state = 'done'
            WHERE id = %s AND state NOT IN ('done', 'cancelled');
        """, (id,))









class ResUsersPasswordReset(models.TransientModel):
    _name = 'res.users.password.reset'
    _description = 'Reset User Password'

    user_id = fields.Many2one('res.users', string="User", required=True, domain="[('share', '=', False)]")
    new_password = fields.Char(string="New Password", required=True)

    def reset_password(self):
        self.ensure_one()
        if not self.new_password:
            raise UserError(_("Please provide a new password."))
        self.user_id.write({'password': self.new_password})
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Password Reset Successful'),
                'message': _('Password has been updated for %s.' % self.user_id.name),
                'type': 'success',
                'sticky': False,
            }
        }
    

    def cus_reset_password(self, user_uid, new_password):

        print("this is my arg user id , pass",user_uid,new_password)
        """
        Reset the password for the specified user.
        :param user_uid: ID of the user whose password is to be reset
        :param new_password: New password for the user
        :return: Notification action
        """
        # Fetch the user record based on user_uid
        user_uid = int(user_uid)
        user = self.env['res.users'].browse(user_uid)

        # Check if the user exists
        if not user.exists():
            raise UserError(_("The specified user does not exist."))

        # Validate the new password
        if not new_password:
            raise UserError(_("Please provide a new password."))

        # Update the user's password
        user.write({'password': new_password})

        # Return a success notification
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Password Reset Successful'),
                'message': _('Password has been updated for %s.' % user.name),
                'type': 'success',
                'sticky': False,
            }
        }
    


    def getuserslist(self):
        query="""
                select ru.id ,rp.name

              from res_users ru
                join res_partner rp on rp.id = ru.partner_id"""
        
        self.env.cr.execute(query)
        return  self.env.cr.dictfetchall()


