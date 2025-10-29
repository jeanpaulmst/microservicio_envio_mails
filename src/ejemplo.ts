
export const htmlEmail: string = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email de Prueba</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">¡Bienvenido!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Este es un email de prueba</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Probando estilos de email</h2>
              
              <p style="color: #666666; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                Este es un ejemplo de cómo se ven diferentes elementos HTML en un correo electrónico.
              </p>
              
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Los <strong style="color: #333333;">textos en negrita</strong> y 
                <em style="color: #667eea;">cursiva</em> funcionan bien en la mayoría de clientes de correo.
              </p>
              
              <!-- Button -->
              <table role="presentation" style="margin: 25px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://www.ejemplo.com" style="background-color: #667eea; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                      Botón de Acción
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- List -->
              <h3 style="color: #333333; margin: 25px 0 15px 0; font-size: 18px;">Características:</h3>
              <ul style="color: #666666; line-height: 1.8; padding-left: 20px;">
                <li>Estilos inline para máxima compatibilidad</li>
                <li>Diseño responsive</li>
                <li>Colores consistentes</li>
                <li>Funciona en la mayoría de clientes</li>
              </ul>
              
              <!-- Info Box -->
              <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-left: 4px solid #667eea; margin: 25px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #333333; margin: 0; font-size: 14px;">
                      <strong>💡 Tip:</strong> Los estilos CSS deben ser inline para funcionar correctamente en todos los clientes de correo.
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                © 2025 Tu Empresa. Todos los derechos reservados.
              </p>
              <p style="color: #999999; margin: 0; font-size: 12px;">
                Mendoza, Argentina
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

