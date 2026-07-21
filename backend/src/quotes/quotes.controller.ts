import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { PERMISSIONS } from "../common/constants/permissions";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Permissions } from "../common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { ConvertQuoteDto } from "./dto/convert-quote.dto";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { CreateQuoteDto } from "./dto/create-quote.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { UpdateQuoteDto } from "./dto/update-quote.dto";
import { QuotesService } from "./quotes.service";

@Controller("quotes")
export class QuotesController {
  constructor(private readonly service: QuotesService) {}
  @Permissions(PERMISSIONS.QUOTES_READ) @Get() findAll(@CurrentUser() user: AuthenticatedUser, @Query("status") status?: string, @Query("productType") productType?: string) { return this.service.findAll(requireCompanyId(user), status, productType); }
  @Permissions(PERMISSIONS.QUOTES_READ) @Get(":id") findOne(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.findOne(id, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateQuoteDto) { return this.service.create(dto, requireCompanyId(user), user.id); }
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Patch(":id") update(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: UpdateQuoteDto) { return this.service.update(id, dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Delete(":id") remove(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.remove(id, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Post(":id/offers") addOffer(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: CreateOfferDto) { return this.service.addOffer(id, dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Patch("offers/:offerId") updateOffer(@CurrentUser() user: AuthenticatedUser, @Param("offerId", ParseIntPipe) offerId: number, @Body() dto: UpdateOfferDto) { return this.service.updateOffer(offerId, dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Post(":id/offers/:offerId/select") selectOffer(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Param("offerId", ParseIntPipe) offerId: number) { return this.service.selectOffer(id, offerId, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Post(":id/documents") addDocument(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: CreateDocumentDto) { return this.service.addDocument(id, dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Delete("documents/:documentId") removeDocument(@CurrentUser() user: AuthenticatedUser, @Param("documentId", ParseIntPipe) documentId: number) { return this.service.removeDocument(documentId, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_CONVERT) @Post(":id/convert") convert(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: ConvertQuoteDto) { return this.service.convertToPolicy(id, dto, requireCompanyId(user), user.id); }
}
