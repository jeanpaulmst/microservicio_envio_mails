export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Microservicio de Envío de Mails',
    description: 'API para gestión de templates de email, envío de mails y autenticación de microservicios.',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local'
    }
  ],
  paths: {
    '/api/templates': {
      post: {
        tags: ['Templates'],
        summary: 'Crear template',
        description: 'Crea un nuevo template de email con variables de sustitución ({{variable}}).',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTemplateRequest' },
              example: {
                templateId: 'welcome-email',
                subject: 'Bienvenido {{userName}}!',
                htmlBody: '<h1>Hola {{userName}}</h1><p>Bienvenido a {{serviceName}}.</p>',
                textBody: 'Hola {{userName}}, bienvenido a {{serviceName}}.',
                microserviceOwner: 'auth-service'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Template creado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTemplateResponse' }
              }
            }
          },
          '400': {
            description: 'Error de validación (campos faltantes, variables inválidas, template duplicado)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '401': {
            description: 'API key ausente o inválida',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '500': {
            description: 'Error interno del servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/templates/{templateId}': {
      put: {
        tags: ['Templates'],
        summary: 'Modificar template',
        description: 'Modifica un template existente. Requiere autenticación mediante header x-api-key. Solo el microservicio propietario puede modificar sus templates.',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: 'templateId',
            in: 'path',
            required: true,
            description: 'ID del template a modificar',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ModifyTemplateRequest' },
              example: {
                subject: 'Bienvenido {{userName}} a {{serviceName}}!',
                htmlBody: '<h1>Hola {{userName}}</h1><p>Tu cuenta en {{serviceName}} está lista.</p>',
                textBody: 'Hola {{userName}}, tu cuenta en {{serviceName}} está lista.'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Template modificado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ModifyTemplateResponse' }
              }
            }
          },
          '400': {
            description: 'Error de validación',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '401': {
            description: 'API key ausente o inválida',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '403': {
            description: 'Sin permiso para modificar este template',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '404': {
            description: 'Template no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '500': {
            description: 'Error interno del servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar microservicio',
        description: 'Registra un nuevo microservicio con su clave de autenticación para poder operar con la API.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterAuthRequest' },
              example: {
                key: 'mi-api-key-secreta',
                microserviceOwner: 'auth-service',
                active: true
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Microservicio registrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterAuthResponse' }
              }
            }
          },
          '400': {
            description: 'Error de validación (campos faltantes, microservicio duplicado)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '500': {
            description: 'Error interno del servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/mailEvents': {
      post: {
        tags: ['Mail Events'],
        summary: 'Crear evento de mail',
        description: 'Crea un nuevo evento de envío de email asociado a un template existente. Valida que el template exista, no esté eliminado, y que templateData provea todas las variables requeridas por el template. Si no se envía scheduledFor, se asigna la fecha y hora actual.',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMailEventRequest' },
              example: {
                templateId: 'welcome-email',
                to: 'usuario@ejemplo.com',
                from: 'servicio@ejemplo.com',
                templateData: {
                  userName: 'Juan',
                  serviceName: 'MiApp'
                },
                retries: 5
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Evento de mail creado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateMailEventResponse' }
              }
            }
          },
          '400': {
            description: 'Error de validación (campos faltantes, formato de fecha inválido, fecha en el pasado, variables faltantes, email inválido)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '401': {
            description: 'API key ausente o inválida',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '404': {
            description: 'Template no encontrado o eliminado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '500': {
            description: 'Error interno del servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Health check',
        description: 'Verifica que el servicio esté funcionando correctamente.',
        responses: {
          '200': {
            description: 'Servicio activo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    service: { type: 'string', example: 'mail-service' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key del microservicio registrado'
      }
    },
    schemas: {
      CreateTemplateRequest: {
        type: 'object',
        required: ['templateId', 'subject', 'htmlBody', 'microserviceOwner'],
        properties: {
          templateId: { type: 'string', description: 'Identificador único del template' },
          subject: { type: 'string', description: 'Asunto del email (soporta variables {{var}})' },
          htmlBody: { type: 'string', description: 'Cuerpo HTML del email (soporta variables {{var}})' },
          textBody: { type: 'string', description: 'Cuerpo de texto plano (opcional, soporta variables {{var}})' },
          microserviceOwner: { type: 'string', description: 'Nombre del microservicio propietario' }
        }
      },
      ModifyTemplateRequest: {
        type: 'object',
        required: ['subject', 'htmlBody'],
        properties: {
          subject: { type: 'string', description: 'Nuevo asunto del email' },
          htmlBody: { type: 'string', description: 'Nuevo cuerpo HTML del email' },
          textBody: { type: 'string', description: 'Nuevo cuerpo de texto plano (opcional)' }
        }
      },
      RegisterAuthRequest: {
        type: 'object',
        required: ['key', 'microserviceOwner'],
        properties: {
          key: { type: 'string', description: 'Clave de autenticación del microservicio' },
          microserviceOwner: { type: 'string', description: 'Nombre del microservicio' },
          active: { type: 'boolean', description: 'Estado activo/inactivo (default: true)' }
        }
      },
      CreateTemplateResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Template created successfully' },
          templateId: { type: 'string', example: 'welcome-email' }
        }
      },
      ModifyTemplateResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Template updated successfully' },
          template: {
            type: 'object',
            properties: {
              templateId: { type: 'string', example: 'welcome-email' },
              subject: { type: 'string', example: 'Bienvenido {{userName}}!' },
              htmlBody: { type: 'string', example: '<h1>Hola {{userName}}</h1>' },
              textBody: { type: 'string', nullable: true, example: 'Hola {{userName}}' },
              microserviceOwner: { type: 'string', example: 'auth-service' }
            }
          }
        }
      },
      RegisterAuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Microservice authentication created successfully' },
          key: { type: 'string', example: 'mi-api-key-secreta' }
        }
      },
      CreateMailEventRequest: {
        type: 'object',
        required: ['templateId', 'to', 'from', 'templateData'],
        properties: {
          templateId: { type: 'string', description: 'ID del template a utilizar' },
          to: { type: 'string', format: 'email', description: 'Dirección de email del destinatario' },
          from: { type: 'string', format: 'email', description: 'Dirección de email del remitente' },
          templateData: {
            type: 'object',
            additionalProperties: { type: 'string' },
            description: 'Objeto con los valores para las variables del template (clave: nombre de variable, valor: texto de sustitución)'
          },
          scheduledFor: { type: 'string', format: 'date-time', description: 'Fecha y hora de envío programado (ISO 8601). Si no se envía, se usa la fecha y hora actual.' },
          retries: { type: 'integer', minimum: 0, description: 'Cantidad máxima de reintentos (default: 3)' }
        }
      },
      CreateMailEventResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Mail event created successfully' },
          mailEventId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' }
        }
      }
    }
  }
};
