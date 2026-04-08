import {inngest} from "@/lib/inngest/client";
import {signUpEmail} from "better-auth/api";
import {CountrySelectField} from "@/components/forms/CountrySelectField";
import {PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendWelcomeEmail} from "@/lib/nodemailer";

''

export const sendSignUpEmail = inngest.createFunction(
    {id: 'sign-up-email'},
    {event: 'app/user.created'},
    async ({event , step}) => {
        const userProfile = `
        -Country: ${event.data.country}
        -Investment goals: ${event.data.investmentGoals}
        -Risk tolerance: ${event.data.riskTolerance}
        -Preffered industry: ${event.data.prefferedIndustry}
        `
        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(`{{userProfile}`, userProfile)
        const response = await step.ai.infer('gernerate-welcome-intro',{
            model: step.ai.models.gemini({model: 'gemini-2.5-flash-lite'}),
            body:{
                contents:[
                    {
                        role: 'user',
                        parts: [
                            {text:prompt}
                        ]
                    }
                ]
            }
        })

        await step.run('send-welcome-email', async()=>{
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Big-bull. You’ve joined now start tracking your investments and market insights right away. '

            const {data :{email , name}}= event;
            return await sendWelcomeEmail({
                email, name ,intro: introText,
            })
        })
        return{
            success:true,
            message: 'Welcome email sent successfully!'
        }
    }
)
