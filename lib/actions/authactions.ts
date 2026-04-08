'use server';
import {auth} from '@/lib/better-auth/auth'
import {inngest} from '@/lib/inngest/client'
import {success} from "zod";
export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals , riskTolerance, prefferedIndustry})=>{
    try {
    const response = await auth.api.signUpEmail({
        body: {email,  password, name: fullName}
    });

    if(response){
        await inngest.send({
            name: 'app/user.created',
            data:{email,  name: fullName, country, investmentGoals, riskTolerance, prefferedIndustry}
        })
    }
    return {success: true, data: response }
    }catch(e){
        console.log('Sign up failed', e)
        return {success:false, error:'Sign up failed'};
    }
}